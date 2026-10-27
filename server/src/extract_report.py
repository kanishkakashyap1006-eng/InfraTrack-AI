#!/usr/bin/env python3
import csv, io, json, os, re, subprocess, sys, zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

path = Path(sys.argv[1])
ext = path.suffix.lower()
LIMIT = 50000

def clean(s):
    s = (s or '').replace('\x00', '')
    s = re.sub(r'[ \t]+\n', '\n', s)
    s = re.sub(r'\n{3,}', '\n\n', s)
    return s.strip()[:LIMIT]

def xml_text(data):
    root = ET.fromstring(data)
    return ' '.join(t for t in root.itertext() if t and t.strip())

try:
    result = ''
    if ext in ('.txt', '.csv'):
        result = path.read_text(encoding='utf-8-sig', errors='replace')
    elif ext == '.docx':
        with zipfile.ZipFile(path) as z:
            result = xml_text(z.read('word/document.xml'))
            try:
                result += '\n\nHeaders/footers: ' + ' '.join(xml_text(z.read(n)) for n in z.namelist() if re.fullmatch(r'word/(header|footer)\d+\.xml', n))
            except Exception: pass
    elif ext in ('.xlsx', '.xlsm'):
        with zipfile.ZipFile(path) as z:
            ns = {'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
            shared=[]
            if 'xl/sharedStrings.xml' in z.namelist():
                ss=ET.fromstring(z.read('xl/sharedStrings.xml'))
                shared=[''.join(t.text or '' for t in si.iter('{%s}t'%ns['m'])) for si in ss.findall('m:si',ns)]
            wb=ET.fromstring(z.read('xl/workbook.xml'))
            relroot=ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
            relns='{http://schemas.openxmlformats.org/package/2006/relationships}'
            rels={r.attrib['Id']:r.attrib['Target'] for r in relroot.findall(relns+'Relationship')}
            chunks=[]
            for sh in wb.findall('m:sheets/m:sheet',ns):
                target=rels.get(sh.attrib.get('{%s}id'%ns['r']), '')
                target=target.lstrip('/')
                if not target.startswith('xl/'): target='xl/'+target
                if target not in z.namelist(): continue
                sheet=ET.fromstring(z.read(target)); rows=[]
                for row in sheet.findall('.//m:sheetData/m:row',ns):
                    vals=[]
                    for cell in row.findall('m:c',ns):
                        v=cell.find('m:v',ns); value='' if v is None else (v.text or '')
                        if cell.attrib.get('t')=='s' and value.isdigit() and int(value)<len(shared): value=shared[int(value)]
                        elif cell.attrib.get('t')=='inlineStr':
                            isel=cell.find('m:is',ns); value=''.join(t.text or '' for t in isel.iter('{%s}t'%ns['m'])) if isel is not None else ''
                        vals.append(value)
                    if any(vals): rows.append('\t'.join(vals))
                chunks.append('Sheet: '+sh.attrib.get('name','Sheet')+'\n'+'\n'.join(rows))
            result='\n\n'.join(chunks)
    elif ext == '.pdf':
        try:
            result=subprocess.run(['pdftotext','-layout',str(path),'-'],capture_output=True,text=True,timeout=30,check=True).stdout
        except (FileNotFoundError, subprocess.SubprocessError):
            # Fallback for PDFs with uncompressed text operators.
            raw=path.read_bytes().decode('latin1',errors='ignore')
            chunks=re.findall(r'\((.{1,2000}?)\)\s*Tj',raw,re.S)
            result=' '.join(re.sub(r'\\([()\\])',r'\1',x) for x in chunks)
    elif ext in ('.png','.jpg','.jpeg','.webp'):
        result=subprocess.run(['tesseract',str(path),'stdout','-l','eng'],capture_output=True,text=True,timeout=60,check=True).stdout
    else:
        result='Automatic text extraction is not supported for this file type. You can enter or correct details using Edit extracted details.'
    result=clean(result)
    if not result: result='No readable text was found. You can enter or correct details using Edit extracted details.'
    print(json.dumps({'text':result},ensure_ascii=False))
except Exception as e:
    print(json.dumps({'text':'Automatic text extraction could not read this file ('+str(e)+'). You can enter or correct details using Edit extracted details.'},ensure_ascii=False))
