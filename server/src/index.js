import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import multer from 'multer'
import Database from 'better-sqlite3'
import path from 'node:path'
import crypto from 'node:crypto'
import fs from 'node:fs'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
const execFileAsync = promisify(execFile)
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SERVER_ROOT = path.resolve(__dirname, '..')
const DATA_DIR = path.join(SERVER_ROOT, 'data')
const UPLOAD_DIR = path.join(SERVER_ROOT, 'uploads')
fs.mkdirSync(DATA_DIR, { recursive: true })
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const db = new Database(path.join(DATA_DIR, 'infratrack.db'))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')
db.exec(`
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  client TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  start_date TEXT NOT NULL DEFAULT '',
  end_date TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK(status IN ('active','planned','completed')),
  report_name TEXT NOT NULL,
  report_path TEXT NOT NULL,
  report_mime TEXT NOT NULL,
  report_size INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_updated ON projects(updated_at DESC);
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL, submitter TEXT NOT NULL DEFAULT 'Project team',
  notes TEXT NOT NULL DEFAULT '', file_name TEXT NOT NULL, file_path TEXT NOT NULL,
  mime_type TEXT NOT NULL, file_size INTEGER NOT NULL, extracted_text TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','rejected')),
  created_at TEXT NOT NULL, reviewed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_reports_project ON reports(project_id, created_at DESC);
`)

const app = express()
app.disable('x-powered-by')
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' }))
app.use(morgan('tiny'))

const allowedExt = new Set(['.pdf', '.xls', '.xlsx', '.docx'])
const allowedMime = new Set([
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Some browsers/OSes use these for Excel files.
  'application/octet-stream',
])
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase()
      cb(null, `${crypto.randomUUID()}${ext}`)
    },
  }),
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (!allowedExt.has(ext) || !allowedMime.has(file.mimetype)) {
      return cb(new Error('Unsupported report format. Upload a PDF, XLS, XLSX, or DOCX file.'))
    }
    cb(null, true)
  },
})

const reportUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 20 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (!new Set(['.pdf','.docx','.xls','.xlsx','.csv','.txt','.jpg','.jpeg','.png','.webp']).has(ext)) return cb(new Error('Unsupported report file type.'))
    cb(null, true)
  },
})

const statuses = new Set(['active', 'planned', 'completed'])
const now = () => new Date().toISOString()
const asProject = row => row ? ({ ...row, report_url: `/uploads/${encodeURIComponent(row.report_path)}` }) : null
const getProject = db.prepare('SELECT * FROM projects WHERE id = ?')
const insertProject = db.prepare(`INSERT INTO projects
(id,name,client,location,description,start_date,end_date,status,report_name,report_path,report_mime,report_size,created_at,updated_at)
VALUES (@id,@name,@client,@location,@description,@start_date,@end_date,@status,@report_name,@report_path,@report_mime,@report_size,@created_at,@updated_at)`)
const updateProject = db.prepare(`UPDATE projects SET
 name=@name, client=@client, location=@location, description=@description,
 start_date=@start_date, end_date=@end_date, status=@status, updated_at=@updated_at WHERE id=@id`)

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'infratrack-ai-api' }))

app.get('/api/projects', (req, res) => {
  const status = String(req.query.status || '').toLowerCase()
  const q = String(req.query.q || '').trim().slice(0, 160)
  if (status && status !== 'all' && !statuses.has(status)) return res.status(400).json({ error: 'Invalid status filter.' })
  let rows
  if (q && status && status !== 'all') {
    const like = `%${q}%`
    rows = db.prepare(`SELECT * FROM projects WHERE status=? AND
      (name LIKE ? OR client LIKE ? OR location LIKE ? OR description LIKE ? OR report_name LIKE ?)
      ORDER BY updated_at DESC`).all(status, like, like, like, like, like)
  } else if (q) {
    const like = `%${q}%`
    rows = db.prepare(`SELECT * FROM projects WHERE
      (name LIKE ? OR client LIKE ? OR location LIKE ? OR description LIKE ? OR report_name LIKE ?)
      ORDER BY updated_at DESC`).all(like, like, like, like, like)
  } else if (status && status !== 'all') {
    rows = db.prepare('SELECT * FROM projects WHERE status=? ORDER BY updated_at DESC').all(status)
  } else {
    rows = db.prepare('SELECT * FROM projects ORDER BY updated_at DESC').all()
  }
  res.json({ projects: rows.map(asProject), total: rows.length })
})

app.get('/api/projects/:id', (req, res) => {
  const project = asProject(getProject.get(req.params.id))
  if (!project) return res.status(404).json({ error: 'Project not found.' })
  res.json({ project })
})

app.post('/api/projects', (req, res) => {
  upload.single('report')(req, res, err => {
    if (err) {
      const tooLarge = err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE'
      return res.status(tooLarge ? 413 : 400).json({ error: tooLarge ? 'Report must be 15 MB or smaller.' : err.message || 'Report upload failed.' })
    }
    const file = req.file
    const body = req.body || {}
    const name = String(body.name || '').trim()
    const status = String(body.status || 'planned').toLowerCase()
    const start_date = String(body.start_date || '').trim()
    const end_date = String(body.end_date || '').trim()
    const client = String(body.client || '').trim()
    const location = String(body.location || '').trim()
    const description = String(body.description || '').trim()
    const cleanup = () => { if (file?.path && fs.existsSync(file.path)) fs.unlinkSync(file.path) }
    if (!name) { cleanup(); return res.status(400).json({ error: 'Project name is required.' }) }
    if (name.length > 120 || client.length > 120 || location.length > 160 || description.length > 1200) {
      cleanup(); return res.status(400).json({ error: 'One or more fields exceed the allowed length.' })
    }
    if (!statuses.has(status)) { cleanup(); return res.status(400).json({ error: 'Choose a valid project status.' }) }
    if (!file) return res.status(400).json({ error: 'A planned report is required.' })
    if (start_date && end_date && end_date < start_date) { cleanup(); return res.status(400).json({ error: 'Planned finish must be on or after the start date.' }) }
    // Extension and MIME are checked by Multer; basic signatures help reject renamed files.
    try {
      const fd = fs.openSync(file.path, 'r')
      const buf = Buffer.alloc(8)
      const bytes = fs.readSync(fd, buf, 0, 8, 0)
      fs.closeSync(fd)
      const ext = path.extname(file.originalname).toLowerCase()
      const signatureOkay =
        (ext === '.pdf' && buf.subarray(0, 5).toString() === '%PDF-') ||
        (ext === '.xls' && (buf.subarray(0, 4).equals(Buffer.from([0xD0,0xCF,0x11,0xE0])) || buf.subarray(0,2).equals(Buffer.from([0x09,0x08])))) ||
        (ext === '.xlsx' && buf.subarray(0,4).equals(Buffer.from([0x50,0x4B,0x03,0x04]))) ||
        (ext === '.docx' && buf.subarray(0,4).equals(Buffer.from([0x50,0x4B,0x03,0x04])))
      if (bytes < 4 || !signatureOkay) { cleanup(); return res.status(400).json({ error: 'The file content does not match its extension or is invalid.' }) }
    } catch { cleanup(); return res.status(400).json({ error: 'Could not validate the uploaded report.' }) }
    const timestamp = now()
    const project = {
      id: crypto.randomUUID(), name, client, location, description, start_date, end_date, status,
      report_name: path.basename(file.originalname).slice(0, 255), report_path: path.basename(file.filename),
      report_mime: file.mimetype, report_size: file.size, created_at: timestamp, updated_at: timestamp,
    }
    try {
      insertProject.run(project)
      return res.status(201).json({ project: asProject(project) })
    } catch (e) {
      cleanup()
      console.error(e)
      return res.status(500).json({ error: 'Could not save the project to the database.' })
    }
  })
})

app.patch('/api/projects/:id', (req, res) => {
  const existing = getProject.get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Project not found.' })
  const allowed = ['name','client','location','description','start_date','end_date','status']
  const unknown = Object.keys(req.body || {}).filter(k => !allowed.includes(k))
  if (unknown.length) return res.status(400).json({ error: `Fields cannot be updated here: ${unknown.join(', ')}` })
  const project = { ...existing }
  for (const key of allowed) if (req.body[key] !== undefined) project[key] = String(req.body[key]).trim()
  if (!project.name) return res.status(400).json({ error: 'Project name is required.' })
  if (project.name.length > 120 || project.client.length > 120 || project.location.length > 160 || project.description.length > 1200) return res.status(400).json({ error: 'One or more fields exceed the allowed length.' })
  if (!statuses.has(project.status)) return res.status(400).json({ error: 'Choose a valid project status.' })
  if (project.start_date && project.end_date && project.end_date < project.start_date) return res.status(400).json({ error: 'Planned finish must be on or after the start date.' })
  project.updated_at = now()
  updateProject.run(project)
  res.json({ project: asProject(getProject.get(project.id)) })
})

app.delete('/api/projects/:id', (req, res) => {
  const project = getProject.get(req.params.id)
  if (!project) return res.status(404).json({ error: 'Project not found.' })
  const remove = db.transaction(() => {
    db.prepare('DELETE FROM projects WHERE id=?').run(req.params.id)
    const file = path.join(UPLOAD_DIR, path.basename(project.report_path))
    if (fs.existsSync(file)) fs.unlinkSync(file)
  })
  try { remove(); res.json({ ok: true, deleted_id: req.params.id }) }
  catch (e) { console.error(e); res.status(500).json({ error: 'Could not delete the project.' }) }
})

app.use('/uploads', express.static(UPLOAD_DIR, {
  fallthrough: false,
  setHeaders(res) { res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Content-Disposition', 'inline') },
}))
app.use((err, _req, res, _next) => {
  console.error(err)
  if (res.headersSent) return
  res.status(500).json({ error: 'Unexpected server error.' })
})
const PORT = Number(process.env.PORT || 4000)

const reportSelect = db.prepare('SELECT id,project_id,report_type,submitter,notes,file_name,file_path,mime_type,file_size,extracted_text,status,created_at,reviewed_at FROM reports WHERE project_id=? ORDER BY created_at DESC')
app.get('/api/projects/:id/reports', (req,res) => {
  if (!getProject.get(req.params.id)) return res.status(404).json({error:'Project not found.'})
  res.json({reports: reportSelect.all(req.params.id).map(r => ({...r, download_url:`/uploads/${encodeURIComponent(r.file_path)}`}))})
})
app.post('/api/projects/:id/reports', (req,res) => {
  reportUpload.single('report')(req,res,async err => {
    if (err) return res.status(err instanceof multer.MulterError && err.code==='LIMIT_FILE_SIZE' ? 413 : 400).json({error:err.message || 'Upload failed.'})
    const project = getProject.get(req.params.id)
    const file = req.file
    if (!project) { if(file) fs.unlinkSync(file.path); return res.status(404).json({error:'Project not found.'}) }
    if (!file) return res.status(400).json({error:'Choose a report file.'})
    const report_type = String(req.body.report_type || 'Other document').slice(0,80)
    const submitter = String(req.body.submitter || 'Project team').trim().slice(0,120)
    const notes = String(req.body.notes || '').trim().slice(0,3000)
    let extracted_text = ''
    try {
      // Python's standard library extracts DOCX/XLSX/TXT/CSV; pdftotext and
      // Tesseract are used when installed for PDF and image OCR respectively.
      const extractor = path.join(__dirname, 'extract_report.py')
      const { stdout } = await execFileAsync(process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3'), [extractor, file.path], { timeout: 70000, maxBuffer: 1024 * 1024 })
      extracted_text = String(JSON.parse(stdout).text || '').slice(0, 50000)
    } catch (extractError) {
      console.error('Report text extraction failed:', extractError.message)
      extracted_text = 'Automatic text extraction could not read this file. You can enter or correct details using Edit extracted details.'
    }
    const row = {id:crypto.randomUUID(),project_id:project.id,report_type,submitter,notes,file_name:path.basename(file.originalname),file_path:path.basename(file.filename),mime_type:file.mimetype,file_size:file.size,extracted_text,status:'pending',created_at:now(),reviewed_at:null}
    db.prepare(`INSERT INTO reports (id,project_id,report_type,submitter,notes,file_name,file_path,mime_type,file_size,extracted_text,status,created_at,reviewed_at) VALUES (@id,@project_id,@report_type,@submitter,@notes,@file_name,@file_path,@mime_type,@file_size,@extracted_text,@status,@created_at,@reviewed_at)`).run(row)
    res.status(201).json({report:{...row,download_url:`/uploads/${encodeURIComponent(row.file_path)}`}})
  })
})
app.patch('/api/reports/:id/review', (req,res) => {
  const row = db.prepare('SELECT * FROM reports WHERE id=?').get(req.params.id)
  if (!row) return res.status(404).json({error:'Report not found.'})
  const status = req.body?.status === undefined ? row.status : String(req.body.status)
  if (!['accepted','rejected','pending'].includes(status)) return res.status(400).json({error:'Review status must be accepted, rejected, or pending.'})
  const extracted_text = req.body?.extracted_text === undefined ? row.extracted_text : String(req.body.extracted_text).slice(0,50000)
  db.prepare('UPDATE reports SET status=?, extracted_text=?, reviewed_at=? WHERE id=?').run(status, extracted_text, status==='pending'?null:now(), row.id)
  const updated = db.prepare('SELECT * FROM reports WHERE id=?').get(row.id)
  res.json({report:{...updated,download_url:`/uploads/${encodeURIComponent(row.file_path)}`}})
})

app.listen(PORT, () => console.log(`InfraTrack AI API listening on http://localhost:${PORT}`))
