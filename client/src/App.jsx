import { useEffect, useMemo, useState } from "react";
import { Link, Route, Routes, useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  Bell,
  Box,
  Building2,
  CalendarDays,
  ChevronRight,
  CircleHelp,
  Download,
  Eye,
  FileCheck2,
  Info,
  MoreHorizontal,
  Search,
  Settings,
  Sparkles,
  Target,
  TriangleAlert,
  Wrench,
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock3,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Plus,
  ShieldCheck,
  Trash2,
  UploadCloud,
  X,
  Zap,
} from "lucide-react";

const API = "/api";
const taglines = [
  "Build with clarity. Deliver with confidence.",
  "Turn complex infrastructure into clear progress.",
  "Every milestone starts with a better plan.",
  "Your projects. One intelligent workspace.",
];
const statusLabel = {
  active: "Active",
  planned: "Planned",
  completed: "Completed",
};
const prettyDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Not set";

function Brand({ small = false }) {
  return (
    <Link
      to="/"
      className={`brand ${small ? "brand-small" : ""}`}
      aria-label="InfraTrack AI home"
    >
      <span className="brand-mark">
        <Activity size={small ? 17 : 21} strokeWidth={2.5} />
      </span>
      <span className="brand-word">
        InfraTrack <span>AI</span>
      </span>
    </Link>
  );
}

function HeroSlogan() {
  return (
    <h1 className="hero-slogan">
      <span className="slogan-white">Build Smart.</span>{" "}
      <span className="slogan-gradient">Track Smarter.</span>
    </h1>
  );
}

function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(false);
  const [tagline, setTagline] = useState(0);
  const [toast, setToast] = useState("");
  const navigate = useNavigate();

  async function loadProjects() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/projects`);
      if (!res.ok)
        throw new Error("Could not load projects. Is the API running?");
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadProjects();
  }, []);
  useEffect(() => {
    const timer = setInterval(
      () => setTagline((n) => (n + 1) % taglines.length),
      4200,
    );
    return () => clearInterval(timer);
  }, []);
  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        const matchStatus = filter === "all" || p.status === filter;
        const q = search.trim().toLowerCase();
        const matchText =
          !q ||
          [p.name, p.client, p.location, p.description, p.report_name].some(
            (v) => (v || "").toLowerCase().includes(q),
          );
        return matchStatus && matchText;
      }),
    [projects, filter, search],
  );

  async function createProject(formData) {
    const res = await fetch(`${API}/projects`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not create project.");
    await loadProjects();
    setModal(false);
    setToast("Project created successfully");
    setTimeout(() => setToast(""), 3000);
    navigate(`/projects/${data.project.id}`);
  }
  async function deleteProject(project) {
    if (!window.confirm(`Delete “${project.name}”? This cannot be undone.`))
      return;
    try {
      const res = await fetch(`${API}/projects/${project.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not delete project.");
      setProjects((list) => list.filter((p) => p.id !== project.id));
      setToast("Project deleted");
      setTimeout(() => setToast(""), 3000);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topline">
        <Brand small />
        <span className="secure-note">
          <span className="live-dot" /> WORKSPACE{" "}
          <span className="top-divider" /> <ShieldCheck size={14} /> Secure
          project hub
        </span>
      </header>
      <main className="workspace">
        <section className="hero">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            <span>INTELLIGENT PROJECT OPERATIONS</span>
            <span className="eyebrow-line" />
          </div>
          <HeroSlogan />
          <div className="tagline-wrap" aria-live="polite">
            <p key={tagline} className="tagline">
              {taglines[tagline]}
            </p>
          </div>
          <p className="hero-copy">
            One focused workspace to plan, track, and deliver infrastructure
            projects.
          </p>
          <button
            className="primary-button create-hero"
            onClick={() => setModal(true)}
          >
            <Plus size={18} /> Create project{" "}
            <span className="button-shortcut">NEW</span>
          </button>
          <div className="trust-row">
            <span>
              <Check size={14} /> Structured project planning
            </span>
            <span>
              <Check size={14} /> Reports in one place
            </span>
            <span>
              <Check size={14} /> Clear project status
            </span>
          </div>
        </section>

        <section className="projects-section">
          <div className="section-heading">
            <div>
              <div className="section-kicker">YOUR WORKSPACE</div>
              <h1>
                Projects <span className="count-pill">{projects.length}</span>
              </h1>
              <p className="section-subtitle">
                Everything in motion, organized in one place.
              </p>
            </div>
            <button className="secondary-button" onClick={() => setModal(true)}>
              <Plus size={17} /> New project
            </button>
          </div>
          <div className="toolbar">
            <label className="search-box">
              <Search size={17} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects, clients, locations…"
                aria-label="Search projects"
              />
              {search && (
                <button
                  className="icon-button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </label>
            <div
              className="filters"
              role="group"
              aria-label="Filter projects by status"
            >
              {["all", "active", "planned", "completed"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`filter-chip ${filter === s ? "selected" : ""}`}
                >
                  {s === "all" ? "All projects" : statusLabel[s]}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="inline-error">
              <span>{error}</span>
              <button
                onClick={() => {
                  setError("");
                  loadProjects();
                }}
              >
                Retry
              </button>
            </div>
          )}
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <span>Loading your workspace…</span>
            </div>
          ) : filtered.length > 0 ? (
            <div className="project-grid">
              {filtered.map((p) => (
                <ProjectCard key={p.id} project={p} onDelete={deleteProject} />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-art">
                <div className="empty-orbit orbit-a" />
                <div className="empty-orbit orbit-b" />
                <div className="empty-icon">
                  <FolderKanban size={27} />
                </div>
                <span className="spark spark-a" />
                <span className="spark spark-b" />
              </div>
              <div className="empty-label">
                <span className="live-dot" /> READY WHEN YOU ARE
              </div>
              <h2>Your next project starts here.</h2>
              <p>
                Create your first project and attach its planned report to give
                your team a clear starting point.
              </p>
              <button className="primary-button" onClick={() => setModal(true)}>
                <Plus size={17} /> Create your first project
              </button>
              <span className="empty-footnote">
                <FileText size={14} /> PDF, Excel, or DOCX report required
              </span>
            </div>
          ) : (
            <div className="no-results">
              <Search size={22} />
              <h3>No matching projects</h3>
              <p>Try a different search or status filter.</p>
              <button
                className="text-button"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
              >
                Clear filters
              </button>
            </div>
          )}
          <div className="section-foot">
            <span>
              <span className="live-dot" /> All changes are saved automatically
            </span>
            <span>
              INFRATRACK AI <span className="foot-sep">/</span> PROJECT HUB
            </span>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <span>Designed for complex work. Built for clear progress.</span>
        <span>
          INFRASTRUCTURE, IN FOCUS <Zap size={13} />
        </span>
      </footer>
      {modal && (
        <CreateModal onClose={() => setModal(false)} onCreate={createProject} />
      )}
      {toast && (
        <div className="toast">
          <Check size={16} />
          {toast}
        </div>
      )}
      <Routes>
        <Route path="/projects/:id" element={<DashboardRoute />} />
      </Routes>
    </div>
  );
}

function ProjectCard({ project, onDelete }) {
  const status = project.status || "planned";
  return (
    <article
      className="project-card"
      role="link"
      tabIndex={0}
      aria-label={`Open ${project.name} dashboard`}
      onClick={(e) => {
        if (!e.target.closest("a, button"))
          window.location.href = `/projects/${project.id}`;
      }}
      onKeyDown={(e) => {
        if (
          (e.key === "Enter" || e.key === " ") &&
          e.target === e.currentTarget
        ) {
          e.preventDefault();
          window.location.href = `/projects/${project.id}`;
        }
      }}
    >
      <div className="card-top">
        <div className="card-icon">
          <FolderKanban size={19} />
        </div>
        <span className={`status-badge status-${status}`}>
          <span />
          {statusLabel[status]}
        </span>
        <button
          className="delete-button"
          onClick={() => onDelete(project)}
          aria-label={`Delete ${project.name}`}
          title="Delete project"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <Link to={`/projects/${project.id}`} className="card-title-link">
        <h3>{project.name}</h3>
      </Link>
      <p className="card-description">
        {project.description || "No project description added."}
      </p>
      <div className="card-details">
        {project.client && (
          <div>
            <span>CLIENT</span>
            <strong>{project.client}</strong>
          </div>
        )}
        {project.location && (
          <div>
            <span>LOCATION</span>
            <strong>{project.location}</strong>
          </div>
        )}
        <div>
          <span>PLANNED FINISH</span>
          <strong>{prettyDate(project.end_date)}</strong>
        </div>
      </div>
      <div className="report-row">
        <div className="report-icon">
          <FileText size={16} />
        </div>
        <div className="report-meta">
          <strong>{project.report_name}</strong>
          <span>Planned report attached</span>
        </div>
        <div className="report-actions">
          <a
            className="report-open report-download-icon"
            href={`/uploads/${encodeURIComponent(project.report_path)}`}
            download={project.report_name}
            aria-label="Download planned report"
            title="Download planned report"
          >
            <Download size={15} />
          </a>
        </div>
      </div>
      <div className="card-bottom">
        <span>
          <Clock3 size={14} /> Updated {prettyDate(project.updated_at)}
        </span>
        <span className="open-link">Click card to open dashboard</span>
      </div>
    </article>
  );
}

function CreateModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    name: "",
    client: "",
    location: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "planned",
  });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const update = (key, value) => setForm((old) => ({ ...old, [key]: value }));
  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!file) {
      setError("Please attach the planned report to continue.");
      return;
    }
    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      setError("Planned finish must be on or after the start date.");
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append("report", file);
    setBusy(true);
    try {
      await onCreate(fd);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [busy, onClose]);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-heading">
          <div>
            <div className="section-kicker">PROJECT SETUP</div>
            <h2 id="modal-title">Create a project</h2>
            <p>Set up the essentials. You can refine details later.</p>
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </div>
        <form onSubmit={submit}>
          <div className="form-grid">
            <label className="field full">
              <span>
                Project name <b>*</b>
              </span>
              <input
                required
                maxLength="120"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Northline Bridge Renewal"
              />
            </label>
            <label className="field">
              <span>Client / organization</span>
              <input
                maxLength="120"
                value={form.client}
                onChange={(e) => update("client", e.target.value)}
                placeholder="Organization name"
              />
            </label>
            <label className="field">
              <span>Project location</span>
              <input
                maxLength="160"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="City, region, or site"
              />
            </label>
            <label className="field">
              <span>Start date</span>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => update("start_date", e.target.value)}
              />
            </label>
            <label className="field">
              <span>Planned finish</span>
              <input
                type="date"
                min={form.start_date || undefined}
                value={form.end_date}
                onChange={(e) => update("end_date", e.target.value)}
              />
            </label>
            <label className="field">
              <span>Initial status</span>
              <span className="select-wrap">
                <select
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                >
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
                <ChevronDown size={15} />
              </span>
            </label>
            <label className="field full">
              <span>Project overview</span>
              <textarea
                rows="3"
                maxLength="1200"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="What are you building, improving, or delivering?"
              />
            </label>
          </div>
          <div className="upload-field">
            <div className="upload-heading">
              <span>
                Planned report <b>*</b>
              </span>
              <span className="required-tag">REQUIRED</span>
            </div>
            <label className={`dropzone ${file ? "has-file" : ""}`}>
              <input
                type="file"
                accept=".pdf,.xls,.xlsx,.docx,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setError("");
                }}
                required
              />
              <div className="upload-symbol">
                {file ? <Check size={20} /> : <UploadCloud size={21} />}
              </div>
              <div className="upload-text">
                <strong>
                  {file ? file.name : "Upload your planned report"}
                </strong>
                <span>
                  {file
                    ? `${(file.size / 1024 / 1024).toFixed(2)} MB · Ready to attach`
                    : "Drag a file here or browse your device"}
                </span>
              </div>
              <span className="browse-button">
                {file ? "Change" : "Browse files"}
              </span>
            </label>
            <p className="upload-hint">
              PDF, XLS, XLSX, or DOCX · Maximum 15 MB
            </p>
          </div>
          {error && (
            <div className="form-error">
              <X size={15} />
              {error}
            </div>
          )}
          <div className="modal-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={busy}
            >
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={busy}>
              {busy ? (
                <>
                  <span className="button-spinner" /> Creating…
                </>
              ) : (
                <>
                  <Plus size={17} /> Create project
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function DashboardRoute() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [section, setSection] = useState("Dashboard");
  const [activitySearch, setActivitySearch] = useState("");
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState("All");
  const [scheduleDisciplineFilter, setScheduleDisciplineFilter] =
    useState("All");
  const [selectedDelayActivity, setSelectedDelayActivity] = useState(null);
  const [selectedProgressMonth, setSelectedProgressMonth] = useState("");
  const [reportType, setReportType] = useState("Daily report");
  const [reportFile, setReportFile] = useState(null);
  const [reportNote, setReportNote] = useState("");
  const [reportHistory, setReportHistory] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [editingExtracted, setEditingExtracted] = useState(false);
  const [editedExtractedText, setEditedExtractedText] = useState("");
  const [reportBusy, setReportBusy] = useState(false);
  const [reportError, setReportError] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("infra-theme") || "dark");
  const [modelImage, setModelImage] = useState(null);
  const [modelImageUrl, setModelImageUrl] = useState("");
  const [showPipes, setShowPipes] = useState(true);
  const [showElectrical, setShowElectrical] = useState(true);
  const [showProgress, setShowProgress] = useState(true);
  const [pipeColor, setPipeColor] = useState("#1686e8");
  const [electricalColor, setElectricalColor] = useState("#e99a24");
  useEffect(() => {
    if (!selectedDelayActivity) return undefined;
    const handleEscape = (event) => {
      if (event.key === "Escape") setSelectedDelayActivity(null);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedDelayActivity]);

  useEffect(() => {
    if (!modelImage) {
      setModelImageUrl("");
      return;
    }
    const url = URL.createObjectURL(modelImage);
    setModelImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [modelImage]);
  useEffect(() => {
    let live = true;
    fetch(`${API}/projects/${id}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Project not found");
        return d.project;
      })
      .then((p) => {
        if (live) setProject(p);
      })
      .catch((e) => {
        if (live) setError(e.message);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [id]);
  useEffect(() => {
    if (!id) return;
    fetch(`${API}/projects/${id}/reports`).then(async r => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not load report history");
      setReportHistory(d.reports || []);
    }).catch(e => setReportError(e.message));
  }, [id]);

  async function changeStatus(status) {
    setSaving(true);
    setError("");
    try {
      const r = await fetch(`${API}/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not update status");
      setProject(d.project);
      setToast("Status updated");
      setTimeout(() => setToast(""), 2200);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  const timelineMonths = useMemo(() => {
    if (
      !project?.start_date ||
      !project?.end_date ||
      project.end_date < project.start_date
    ) {
      return [];
    }

    const start = new Date(`${project.start_date}T12:00:00`);
    const end = new Date(`${project.end_date}T12:00:00`);
    const months = [];

    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);

    const last = new Date(end.getFullYear(), end.getMonth(), 1);

    while (cursor <= last && months.length < 120) {
      months.push({
        value: `${cursor.getFullYear()}-${String(
          cursor.getMonth() + 1,
        ).padStart(2, "0")}`,
        label: cursor.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
      });

      cursor.setMonth(cursor.getMonth() + 1);
    }

    return months;
  }, [project?.start_date, project?.end_date]);
  if (loading)
    return (
      <div className="route-overlay">
        <div className="spinner" />
        <span>Opening project workspace…</span>
      </div>
    );
  if (error && !project)
    return (
      <div className="route-overlay">
        <div className="dashboard-error">
          <h2>Project unavailable</h2>
          <p>{error}</p>
          <Link to="/" className="secondary-button">
            <ArrowLeft size={16} /> Back to projects
          </Link>
        </div>
      </div>
    );
  if (!project) return null;

  const navGroups = [
    {
      title: "WORKSPACE",
      items: [
        ["Dashboard", "LayoutDashboard"],
        ["Schedule", "CalendarDays"],
        ["Reports", "FileText"],
        ["AI Verification", "ShieldCheck"],
        ["3D Visualization", "Box"],
        ["Issues & Constraints", "TriangleAlert"],
      ],
    },
    { title: "PREFERENCES", items: [["Settings", "Settings"]] },
  ];
  const activities = [
    {
      name: "Site preparation",
      level: "Level 01",
      discipline: "Civil",
      planned: "12 Oct",
      actual: "12 Oct",
      status: "Completed",
      progress: 100,
    },
    {
      name: "Foundation works",
      level: "Level 01",
      discipline: "Structural",
      planned: "18 Oct",
      actual: "20 Oct",
      status: "Delayed",
      progress: 72,
    },
    {
      name: "Structural framework",
      level: "Level 02",
      discipline: "Structural",
      planned: "24 Oct",
      actual: "—",
      status: "In progress",
      progress: 46,
    },
    {
      name: "Electrical rough-in",
      level: "Level 02",
      discipline: "Electrical",
      planned: "28 Oct",
      actual: "—",
      status: "Planned",
      progress: 0,
    },
    {
      name: "Plumbing installation",
      level: "Level 02",
      discipline: "Mechanical",
      planned: "30 Oct",
      actual: "—",
      status: "Planned",
      progress: 0,
    },
  ];
  const filteredActivities = activities.filter((a) => {
    const query = activitySearch.trim().toLowerCase();
    const matchesSearch = [a.name, a.level, a.discipline, a.status].some((v) =>
      v.toLowerCase().includes(query),
    );
    const matchesStatus =
      scheduleStatusFilter === "All" ||
      (scheduleStatusFilter === "Critical" && a.status === "Delayed") ||
      a.status === scheduleStatusFilter;
    const matchesDiscipline =
      scheduleDisciplineFilter === "All" ||
      a.discipline === scheduleDisciplineFilter;
    return matchesSearch && matchesStatus && matchesDiscipline;
  });
  const delayedCount = activities.filter((a) => a.status === "Delayed").length;
  const onTrackCount = activities.filter((a) =>
    ["Completed", "In progress"].includes(a.status),
  ).length;

  const activeTimelineMonth =
    selectedProgressMonth || timelineMonths[0]?.value || "";
  const disciplineProgress = [
    { name: "Civil", value: 72, color: "#4d8df5" },
    { name: "Structural", value: 59, color: "#6f9ff2" },
    { name: "Electrical", value: 34, color: "#27b9c5" },
    { name: "Mechanical", value: 42, color: "#83aeea" },
    { name: "Plumbing", value: 26, color: "#9acbd7" },
  ];
  const plannedProgress = 64;
  const actualProgress = 48;
  const navIcon = (name) => {
    const props = { size: 17, strokeWidth: 1.8 };
    const icons = {
      Dashboard: <LayoutDashboard {...props} />,
      Schedule: <CalendarDays {...props} />,
      Reports: <FileText {...props} />,
      "AI Verification": <ShieldCheck {...props} />,
      "3D Visualization": <Box {...props} />,
      "Issues & Constraints": <TriangleAlert {...props} />,
      Settings: <Settings {...props} />,
    };
    return icons[name] || <CircleHelp {...props} />;
  };
  const submitReport = async (e) => {
    e.preventDefault();
    setReportError("");
    if (!reportFile) { setReportError("Please choose a report file first."); return; }
    setReportBusy(true);
    try {
      const body = new FormData();
      body.append("report", reportFile);
      body.append("report_type", reportType);
      body.append("notes", reportNote);
      body.append("submitter", "Project team");
      const response = await fetch(`${API}/projects/${id}/reports`, { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Report submission failed.");
      setReportHistory(list => [data.report, ...list]);
      setSelectedReport(data.report);
      setEditedExtractedText(data.report.extracted_text || "");
      setEditingExtracted(false);
      setReportFile(null); setReportNote("");
      setToast("Report submitted for human verification");
      setTimeout(() => setToast(""), 3000);
    } catch (err) { setReportError(err.message); }
    finally { setReportBusy(false); }
  };
  const reviewReport = async (report, status) => {
    try {
      const response = await fetch(`${API}/reports/${report.id}/review`, {method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({status})});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update review.");
      setReportHistory(list => list.map(item => item.id === report.id ? data.report : item));
      setSelectedReport(data.report);
      setEditedExtractedText(data.report.extracted_text || "");
      setEditingExtracted(false);
    } catch (err) { setReportError(err.message); }
  };
  const saveExtractedDetails = async () => {
    if (!selectedReport) return;
    try {
      const response = await fetch(`${API}/reports/${selectedReport.id}/review`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extracted_text: editedExtractedText })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save extracted details.");
      setReportHistory(list => list.map(item => item.id === data.report.id ? data.report : item));
      setSelectedReport(data.report); setEditingExtracted(false);
    } catch (err) { setReportError(err.message); }
  };
  return (
    <div className={`workspace-app theme-${theme}`}>

      <aside className="workspace-sidebar">
        <div className="sidebar-brand">
          <Brand small />
        </div>
        <div className="project-switcher">
          <span className="switcher-mark">
            <FolderKanban size={17} />
          </span>
          <span className="switcher-copy">
            <small>ACTIVE PROJECT</small>
            <strong>{project.name}</strong>
          </span>
          <ChevronDown size={15} />
        </div>
        {navGroups.map((group) => (
          <div className="nav-group" key={group.title}>
            <div className="nav-group-title">{group.title}</div>
            {group.items.map(([label]) => (
              <button
                key={label}
                className={`sidebar-nav-item ${section === label ? "selected" : ""}`}
                onClick={() => setSection(label)}
              >
                {navIcon(label)}
                <span>{label}</span>
                {label === "Issues & Constraints" && (
                  <span className="nav-count">3</span>
                )}
              </button>
            ))}
          </div>
        ))}
        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <span className="help-icon">
              <Zap size={16} />
            </span>
            <div>
              <strong>Project intelligence</strong>
              <small>AI insights for your site</small>
            </div>
          </div>
          <Link to="/" className="switch-project-link">
            <ArrowLeft size={16} />
            <span>Back to all projects</span>
            <ArrowUpRight size={14} />
          </Link>
          <div className="sidebar-user">
            <div className="user-avatar">U</div>
            <div className="user-copy">
              <strong>Workspace user</strong>
              <small>Project member</small>
            </div>
            <button title="User options" onClick={() => setSection("Settings")}>
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
      </aside>
      <main className="workspace-main">
        <header className="workspace-topbar">
          <div className="topbar-crumb">
            <span>Projects</span>
            <ChevronRight size={14} />
            <strong>{project.name}</strong>
            <ChevronRight size={14} />
            <strong>{section}</strong>
          </div>
          <div className="topbar-actions">
            <span className="connection-state">
              <span /> Workspace synced
            </span>
            <button className="icon-button" title="Notifications">
              <Bell size={17} />
            </button>
            <div className="topbar-avatar">U</div>
          </div>
        </header>
        <div className="workspace-content">
          {section === "Dashboard" ? (
            <>
              <div className="page-heading project-title-only">
                <div>
                  <div className="eyebrow-label">
                    PROJECT OVERVIEW <span className="live-dot" />
                  </div>
                  <h1 className="project-name-heading">{project.name}</h1>
                </div>
              </div>
              <div className="project-info-toolbar">
                <div className="project-context-strip">
                  <div className="context-date">
                    <span>PROJECT START</span>
                    <strong>{prettyDate(project.start_date)}</strong>
                  </div>
                  <div className="context-date">
                    <span>PLANNED COMPLETION</span>
                    <strong>{prettyDate(project.end_date)}</strong>
                  </div>
                  <div className="context-date">
                    <span>WORKSPACE STATUS</span>
                    <strong className={`status-text status-${project.status}`}>
                      {statusLabel[project.status]}
                    </strong>
                  </div>
                </div>
                <div className="heading-actions">
                  <label className="status-control">
                    <span>Project status</span>
                    <select
                      disabled={saving}
                      value={project.status}
                      onChange={(e) => changeStatus(e.target.value)}
                    >
                      <option value="planned">Planned</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </label>
                  <a
                    className="secondary-button planned-report-link"
                    href={`/uploads/${encodeURIComponent(project.report_path)}`}
                    download={project.report_name}
                  >
                    <Download size={16} /> Planned report
                  </a>
                </div>
              </div>
              {error && <div className="inline-error">{error}</div>}
              <div className="metric-grid">
                <div className="metric-card">
                  <div className="metric-top">
                    <span>Planned progress</span>
                    <span className="metric-icon blue">
                      <Target size={17} />
                    </span>
                  </div>
                  <div className="metric-value">{plannedProgress}%</div>
                  <div className="metric-track">
                    <span style={{ width: `${plannedProgress}%` }} />
                  </div>
                  <div className="metric-foot">
                    <span>Baseline target</span>
                    <strong>On plan</strong>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-top">
                    <span>Actual progress</span>
                    <span className="metric-icon cyan">
                      <Activity size={17} />
                    </span>
                  </div>
                  <div className="metric-value">{actualProgress}%</div>
                  <div className="metric-track cyan-track">
                    <span style={{ width: `${actualProgress}%` }} />
                  </div>
                  <div className="metric-foot">
                    <span>Reported completion</span>
                    <strong className="negative">
                      −{plannedProgress - actualProgress}% variance
                    </strong>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-top">
                    <span>Activities delayed</span>
                    <span className="metric-icon orange">
                      <Clock3 size={17} />
                    </span>
                  </div>
                  <div className="metric-value">03</div>
                  <div className="metric-foot">
                    <span>Need attention</span>
                    <strong className="negative">Review required</strong>
                  </div>
                  <div className="metric-note">
                    Based on sample dashboard data
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-top">
                    <span>Reports submitted</span>
                    <span className="metric-icon purple">
                      <FileCheck2 size={17} />
                    </span>
                  </div>
                  <div className="metric-value">12</div>
                  <div className="metric-foot">
                    <span>This project</span>
                    <strong>
                      View reports <ArrowUpRight size={13} />
                    </strong>
                  </div>
                  <div className="metric-note">
                    Connect report history in next phase
                  </div>
                </div>
              </div>
              <div className="dashboard-chart-grid">
                <section className="content-card progress-chart-card">
                  <div className="card-heading">
                    <div>
                      <h2>Planned vs. actual progress</h2>
                      <p>Progress trend across the project timeline</p>
                    </div>
                    <label className="chart-period-select">
                      <span className="sr-only">Timeline month</span>
                      <select
                        aria-label="Choose timeline month"
                        value={activeTimelineMonth}
                        onChange={(e) =>
                          setSelectedProgressMonth(e.target.value)
                        }
                        disabled={!timelineMonths.length}
                      >
                        <option value="" disabled>
                          {timelineMonths.length
                            ? "Select month"
                            : "Dates not set"}
                        </option>
                        {timelineMonths.map((month) => (
                          <option key={month.value} value={month.value}>
                            {month.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} />
                    </label>
                  </div>
                  <div className="chart-legend">
                    <span>
                      <i className="legend-planned" /> Planned
                    </span>
                    <span>
                      <i className="legend-actual" /> Actual
                    </span>
                    <span className="sample-label">Illustrative data</span>
                  </div>
                  <div className="progress-chart">
                    <div className="chart-y-labels">
                      <span>100%</span>
                      <span>75%</span>
                      <span>50%</span>
                      <span>25%</span>
                      <span>0%</span>
                    </div>
                    <div className="chart-plot">
                      <div className="chart-grid-lines">
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                      </div>
                      <svg
                        viewBox="0 0 620 190"
                        preserveAspectRatio="none"
                        role="img"
                        aria-label="Planned progress line compared with actual progress line"
                      >
                        <defs>
                          <linearGradient
                            id="plannedFill"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#4b8dff"
                              stopOpacity=".20"
                            />
                            <stop
                              offset="100%"
                              stopColor="#4b8dff"
                              stopOpacity="0"
                            />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 0 165 L 124 143 L 248 113 L 372 83 L 496 52 L 620 25 L 620 190 L 0 190 Z"
                          fill="url(#plannedFill)"
                        />
                        <polyline
                          points="0,165 124,143 248,113 372,83 496,52 620,25"
                          fill="none"
                          stroke="#568eff"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <polyline
                          points="0,171 124,158 248,140 372,120 496,105 620,98"
                          fill="none"
                          stroke="#31c6c8"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {[
                          [0, 165],
                          [124, 143],
                          [248, 113],
                          [372, 83],
                          [496, 52],
                          [620, 25],
                        ].map(([x, y]) => (
                          <circle
                            key={`p${x}`}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#568eff"
                            stroke="#101a2c"
                            strokeWidth="2"
                          />
                        ))}
                        {[
                          [0, 171],
                          [124, 158],
                          [248, 140],
                          [372, 120],
                          [496, 105],
                          [620, 98],
                        ].map(([x, y]) => (
                          <circle
                            key={`a${x}`}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#31c6c8"
                            stroke="#101a2c"
                            strokeWidth="2"
                          />
                        ))}
                      </svg>
                      <div className="chart-x-labels">
                        {(timelineMonths.length
                          ? timelineMonths.slice(0, 6).map((m) => m.label)
                          : [
                              "Week 1",
                              "Week 2",
                              "Week 3",
                              "Week 4",
                              "Week 5",
                              "Week 6",
                            ]
                        ).map((label) => (
                          <span key={label}>{label}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
                <section className="content-card delay-card">
                  <div className="card-heading">
                    <div>
                      <h2>Delay overview</h2>
                      <p>Activities requiring follow-up</p>
                    </div>
                    <span className="alert-pill">
                      <span /> 3 issues
                    </span>
                  </div>
                  <div className="delay-summary">
                    <div className="delay-ring">
                      <div>
                        <strong>03</strong>
                        <small>Delayed</small>
                      </div>
                    </div>
                    <div className="delay-key">
                      <div>
                        <i className="delay-high" />
                        High impact <strong>1</strong>
                      </div>
                      <div>
                        <i className="delay-medium" />
                        Medium impact <strong>1</strong>
                      </div>
                      <div>
                        <i className="delay-low" />
                        Low impact <strong>1</strong>
                      </div>
                    </div>
                  </div>
                  <div className="delay-list">
                    <div>
                      <span className="delay-dot high" />
                      <div>
                        <strong>Foundation works</strong>
                        <small>Material delivery · 2 days</small>
                      </div>
                      <span className="priority high-text">High</span>
                    </div>
                    <div>
                      <span className="delay-dot medium" />
                      <div>
                        <strong>Structural framework</strong>
                        <small>Labour availability · 1 day</small>
                      </div>
                      <span className="priority medium-text">Medium</span>
                    </div>
                    <div>
                      <span className="delay-dot low" />
                      <div>
                        <strong>Site inspection</strong>
                        <small>Approval pending · 1 day</small>
                      </div>
                      <span className="priority low-text">Low</span>
                    </div>
                  </div>
                  <button
                    className="card-text-link"
                    onClick={() => setSection("Issues & Constraints")}
                  >
                    View all issues <ArrowUpRight size={14} />
                  </button>
                </section>
              </div>
              <section className="content-card discipline-chart-card">
                <div className="card-heading">
                  <div>
                    <h2>Activities by discipline</h2>
                    <p>Progress overview across the project teams</p>
                  </div>
                  <span className="discipline-unit">Completion (%)</span>
                </div>
                <div
                  className="discipline-chart"
                  role="img"
                  aria-label="Bar chart showing illustrative completion by discipline"
                >
                  <div className="discipline-axis">
                    <span>100%</span>
                    <span>75%</span>
                    <span>50%</span>
                    <span>25%</span>
                    <span>0%</span>
                  </div>
                  <div className="discipline-bars-area">
                    <div className="discipline-gridlines">
                      <i />
                      <i />
                      <i />
                      <i />
                      <i />
                    </div>
                    {disciplineProgress.map((item) => (
                      <div className="discipline-bar-column" key={item.name}>
                        <div className="discipline-bar-track">
                          <div
                            className="discipline-bar"
                            style={{
                              height: `${item.value}%`,
                              background: item.color,
                            }}
                          >
                            <span>{item.value}%</span>
                          </div>
                        </div>
                        <span className="discipline-name">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="discipline-note">
                  <Info size={13} /> Illustrative discipline progress. Connect
                  activity-level reporting for live values.
                </p>
              </section>
              <div className="dashboard-lower-grid">
                <section className="content-card activity-card">
                  <div className="card-heading">
                    <div>
                      <h2>Activity snapshot</h2>
                      <p>Recent schedule performance</p>
                    </div>
                    <button
                      className="card-text-link"
                      onClick={() => setSection("Schedule")}
                    >
                      Full schedule <ArrowUpRight size={14} />
                    </button>
                  </div>
                  <div className="mini-activity-list">
                    <div className="mini-activity-row">
                      <span className="activity-state done">
                        <Check size={13} />
                      </span>
                      <div>
                        <strong>Site preparation</strong>
                        <small>Civil · Level 01</small>
                      </div>
                      <div className="mini-progress">
                        <span style={{ width: "100%" }} />
                      </div>
                      <strong className="mini-percent">100%</strong>
                    </div>
                    <div className="mini-activity-row">
                      <span className="activity-state late">
                        <Clock3 size={13} />
                      </span>
                      <div>
                        <strong>Foundation works</strong>
                        <small>Structural · Level 01</small>
                      </div>
                      <div className="mini-progress">
                        <span style={{ width: "72%" }} />
                      </div>
                      <strong className="mini-percent">72%</strong>
                    </div>
                    <div className="mini-activity-row">
                      <span className="activity-state doing">
                        <Activity size={13} />
                      </span>
                      <div>
                        <strong>Structural framework</strong>
                        <small>Structural · Level 02</small>
                      </div>
                      <div className="mini-progress">
                        <span style={{ width: "46%" }} />
                      </div>
                      <strong className="mini-percent">46%</strong>
                    </div>
                  </div>
                </section>
                <section className="content-card ai-insight-card">
                  <div className="ai-heading">
                    <span className="ai-spark">
                      <Sparkles size={18} />
                    </span>
                    <div>
                      <h2>AI delay insights</h2>
                      <p>Potential next steps</p>
                    </div>
                    <span className="preview-chip">PREVIEW</span>
                  </div>
                  <div className="insight-highlight">
                    <strong>
                      Material delivery may affect the next milestone
                    </strong>
                    <p>
                      Foundation works is behind the illustrative baseline.
                      Confirm supplier ETA and review whether non-dependent work
                      can proceed in parallel.
                    </p>
                  </div>
                  <div className="insight-actions">
                    <span>
                      <Check size={14} /> Suggested action
                    </span>
                    <button onClick={() => setSection("AI Verification")}>
                      Review recommendation <ArrowUpRight size={14} />
                    </button>
                  </div>
                  <div className="ai-disclaimer">
                    AI recommendations will be connected to project data in a
                    later phase.
                  </div>
                </section>
              </div>
              <section className="content-card report-upload-card">
                <div className="report-upload-intro">
                  <span className="upload-card-icon">
                    <UploadCloud size={20} />
                  </span>
                  <div>
                    <h2>Submit a site report</h2>
                    <p>
                      Capture daily updates, progress notes, and site documents
                      in one place.
                    </p>
                  </div>
                </div>
                <form className="quick-report-form" onSubmit={submitReport}>
                  <label className="quick-report-type">
                    <span>Report type</span>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                    >
                      <option>Daily report</option>
                      <option>Monthly report</option>
                      <option>Site observation</option>
                      <option>Other document</option>
                    </select>
                  </label>
                  <label className="quick-report-note">
                    <span>
                      Quick note <small>(optional)</small>
                    </span>
                    <input
                      value={reportNote}
                      onChange={(e) => setReportNote(e.target.value)}
                      placeholder="Add a brief site update…"
                    />
                  </label>
                  <label
                    className={`quick-file-picker ${reportFile ? "file-selected" : ""}`}
                  >
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png,.webp,.zip"
                      onChange={(e) =>
                        setReportFile(e.target.files?.[0] || null)
                      }
                    />
                    <UploadCloud size={16} />
                    <span>
                      {reportFile ? reportFile.name : "Attach any format"}
                    </span>
                  </label>
                  <button type="submit" className="primary-button">
                    <Plus size={16} /> Add report
                  </button>
                </form>
                <div className="report-upload-foot">
                  <Info size={14} /> Preview only: report storage, submission
                  history, and downloads will be wired to the backend in the
                  next phase.
                </div>
              </section>
              <section className="content-card visualization-placeholder">
                <div className="visual-placeholder-icon">
                  <Box size={25} />
                </div>
                <div>
                  <span className="eyebrow-label">SITE MODEL WORKSPACE</span>
                  <h2>Prepare your 3D visualization</h2>
                  <p>
                    Start by uploading a building or site image. Configure
                    utility layers now; interactive 3D model imports can be
                    added in a later phase.
                  </p>
                </div>
                <button
                  className="secondary-button"
                  onClick={() => setSection("3D Visualization")}
                >
                  Open visualization <ArrowUpRight size={15} />
                </button>
              </section>
              <footer className="workspace-footer">
                <span>
                  INFRATRACK AI <i>/</i> PROJECT INTELLIGENCE
                </span>
                <span>Dashboard preview · Sample metrics are illustrative</span>
              </footer>
            </>
          ) : section === "Schedule" ? (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow-label">PROJECT CONTROLS</div>
                  <h1>Schedule</h1>
                  <p>
                    Search and review planned activities and reported progress.
                  </p>
                </div>
                <span className="section-counter">
                  {activities.length} activities
                </span>
              </div>
              <div className="schedule-kpi-grid">
                <button
                  className={`schedule-kpi ${scheduleStatusFilter === "All" ? "selected" : ""}`}
                  onClick={() => setScheduleStatusFilter("All")}
                >
                  <span className="schedule-kpi-icon">
                    <CalendarDays size={17} />
                  </span>
                  <span>
                    <small>Total activities</small>
                    <strong>{activities.length}</strong>
                  </span>
                </button>
                <button
                  className={`schedule-kpi ${scheduleStatusFilter === "Completed" ? "selected" : ""}`}
                  onClick={() => setScheduleStatusFilter("Completed")}
                >
                  <span className="schedule-kpi-icon on-track">
                    <Check size={17} />
                  </span>
                  <span>
                    <small>Completed</small>
                    <strong>
                      {
                        activities.filter((a) => a.status === "Completed")
                          .length
                      }
                    </strong>
                  </span>
                </button>
                <button
                  className={`schedule-kpi ${scheduleStatusFilter === "Delayed" ? "selected" : ""}`}
                  onClick={() => setScheduleStatusFilter("Delayed")}
                >
                  <span className="schedule-kpi-icon delayed">
                    <Clock3 size={17} />
                  </span>
                  <span>
                    <small>Delayed</small>
                    <strong>{delayedCount}</strong>
                  </span>
                </button>
                <button
                  className={`schedule-kpi ${scheduleStatusFilter === "Critical" ? "selected" : ""}`}
                  onClick={() => setScheduleStatusFilter("Critical")}
                >
                  <span className="schedule-kpi-icon critical">
                    <TriangleAlert size={17} />
                  </span>
                  <span>
                    <small>Needs attention</small>
                    <strong>{delayedCount}</strong>
                  </span>
                </button>
              </div>
              <section className="content-card schedule-table-card">
                <div className="schedule-search-panel">
                  <label className="table-search">
                    <Search size={17} />
                    <input
                      value={activitySearch}
                      onChange={(e) => setActivitySearch(e.target.value)}
                      placeholder="Search activities, zones, disciplines or status…"
                      aria-label="Search schedule activities"
                    />
                    {activitySearch && (
                      <button
                        type="button"
                        className="clear-search"
                        aria-label="Clear search"
                        onClick={() => setActivitySearch("")}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </label>
                  <label className="schedule-filter">
                    <span>Status</span>
                    <select
                      value={scheduleStatusFilter}
                      onChange={(e) => setScheduleStatusFilter(e.target.value)}
                    >
                      <option>All</option>
                      <option>Completed</option>
                      <option>In progress</option>
                      <option>Planned</option>
                      <option>Delayed</option>
                      <option>Critical</option>
                    </select>
                  </label>
                  <label className="schedule-filter">
                    <span>Discipline</span>
                    <select
                      value={scheduleDisciplineFilter}
                      onChange={(e) =>
                        setScheduleDisciplineFilter(e.target.value)
                      }
                    >
                      <option>All</option>
                      {[...new Set(activities.map((a) => a.discipline))].map(
                        (discipline) => (
                          <option key={discipline}>{discipline}</option>
                        ),
                      )}
                    </select>
                  </label>
                  <button
                    className="schedule-reset"
                    onClick={() => {
                      setActivitySearch("");
                      setScheduleStatusFilter("All");
                      setScheduleDisciplineFilter("All");
                    }}
                  >
                    Clear filters
                  </button>
                </div>
                <div className="table-toolbar">
                  <div>
                    <h2>Activity register</h2>
                    <p>
                      {filteredActivities.length} activities · Baseline plan
                      compared with reported progress
                    </p>
                  </div>
                </div>
                <div className="responsive-table">
                  <table className="schedule-table">
                    <thead>
                      <tr>
                        <th>Activity</th>
                        <th>Activity level</th>
                        <th>Discipline</th>
                        <th>Planned</th>
                        <th>Actual</th>
                        <th>Status</th>
                        <th>Progress</th>
                        <th>See Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredActivities.map((a) => (
                        <tr key={a.name}>
                          <td>
                            <strong>{a.name}</strong>
                          </td>
                          <td>{a.level}</td>
                          <td>{a.discipline}</td>
                          <td>{a.planned}</td>
                          <td>{a.actual}</td>
                          <td>
                            <span
                              className={`table-status ${a.status.toLowerCase().replace(" ", "-")}`}
                              style={{
                                fontWeight: 500,
                                color:
                                  {
                                    Completed: "#047857",
                                    Delayed: "#c2410c",
                                    "In progress": "#1d4ed8",
                                    Planned: "#475569",
                                  }[a.status] || "#334155",
                              }}
                            >
                              {a.status === "Delayed"}
                              {a.status}
                            </span>
                          </td>
                          <td>
                            <div className="table-progress">
                              <span>
                                <i style={{ width: `${a.progress}%` }} />
                              </span>
                              <strong>{a.progress}%</strong>
                            </div>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="schedule-report-button"
                              onClick={() => setSelectedDelayActivity(a)}
                              aria-label={`Open schedule report for ${a.name}`}
                              title="View schedule report"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredActivities.length === 0 && (
                    <div className="empty-search">
                      No activities match your search.
                    </div>
                  )}
                </div>
                {selectedDelayActivity && (
                  <div
                    className="delay-modal-backdrop"
                    onMouseDown={(event) => {
                      if (event.target === event.currentTarget)
                        setSelectedDelayActivity(null);
                    }}
                  >
                    <section
                      className="delay-modal"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="delay-modal-title"
                    >
                      <header className="delay-modal-header">
                        <div className="delay-modal-heading-icon">
                          <TriangleAlert size={20} />
                        </div>
                        <div className="delay-modal-heading">
                          <span className="eyebrow-label">
                            {selectedDelayActivity.status === "Delayed"
                              ? "SCHEDULE DELAY REPORT"
                              : "SCHEDULE ACTIVITY REPORT"}{" "}
                            · {selectedDelayActivity.level}
                          </span>
                          <h2 id="delay-modal-title">
                            {selectedDelayActivity.name}
                          </h2>
                          <p>
                            {selectedDelayActivity.discipline} ·{" "}
                            {selectedDelayActivity.status} activity details
                          </p>
                        </div>
                        <button
                          className="delay-modal-close"
                          onClick={() => setSelectedDelayActivity(null)}
                          aria-label="Close delay details"
                        >
                          <X size={19} />
                        </button>
                      </header>
                      <div className="delay-modal-body">
                        <div className="delay-modal-metrics">
                          <div>
                            <span>Planned finish</span>
                            <strong>{selectedDelayActivity.planned}</strong>
                          </div>
                          <div>
                            <span>Reported actual</span>
                            <strong>
                              {selectedDelayActivity.actual === "—"
                                ? "Not completed"
                                : selectedDelayActivity.actual}
                            </strong>
                          </div>
                          <div>
                            <span>Current progress</span>
                            <strong>{selectedDelayActivity.progress}%</strong>
                          </div>
                          <div>
                            <span>Status</span>
                            <strong
                              className={
                                selectedDelayActivity.status === "Delayed"
                                  ? "delay-text"
                                  : ""
                              }
                            >
                              {selectedDelayActivity.status}
                            </strong>
                          </div>
                        </div>
                        {selectedDelayActivity.status === "Delayed" && (
                          <>
                            <div className="delay-detail-panel">
                              <h3>
                                <Search size={15} /> Where is the bottleneck?
                              </h3>
                              <p>
                                The activity is behind its planned finish. The
                                current schedule preview does not contain a
                                verified root cause, so confirm the latest site
                                report, predecessor activity, material
                                availability and outstanding approvals before
                                assigning a cause.
                              </p>
                            </div>
                            <div className="delay-recovery-panel">
                              <h3>
                                <Wrench size={16} /> Recommended recovery plan
                              </h3>
                              <ol>
                                <li>
                                  Check the preceding activity and resolve any
                                  pending approvals or handover dependencies.
                                </li>
                                <li>
                                  Confirm labour, materials and equipment
                                  availability with the responsible discipline
                                  lead.
                                </li>
                                <li>
                                  Agree a recovery action, assign an owner, and
                                  set a realistic target date with the site
                                  team.
                                </li>
                                <li>
                                  Update actual progress daily and revise the
                                  forecast only after confirming site
                                  conditions.
                                </li>
                              </ol>
                            </div>
                            <div className="delay-modal-footnote">
                              <Info size={14} /> Suggested actions are guidance.
                              Confirm the cause and recovery target with project
                              records before acting.
                            </div>
                          </>
                        )}
                      </div>
                      <footer className="delay-modal-footer">
                        <button
                          className="secondary-button"
                          onClick={() => setSelectedDelayActivity(null)}
                        >
                          Close details
                        </button>
                        {selectedDelayActivity.status === "Delayed" && (
                          <button
                            className="primary-button"
                            onClick={() => {
                              setToast(
                                `Recovery review noted for ${selectedDelayActivity.name}. Confirm owner and target date with the site team.`,
                              );
                              setSelectedDelayActivity(null);
                            }}
                          >
                            <Check size={15} /> Acknowledge review
                          </button>
                        )}
                      </footer>
                    </section>
                  </div>
                )}
                <div className="preview-note">
                  <Info size={14} /> Sample activity rows for layout preview.
                  Live schedule data will be connected in the backend phase.
                </div>
              </section>
            </>
          ) : section === "Reports" ? (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow-label">SITE DOCUMENTATION</div>
                  <h1>Reports</h1>
                  <p>
                    Submit daily or monthly reports and access report history.
                  </p>
                </div>
              </div>
              <div className="reports-layout-grid">
              <section className="content-card reports-page-card">
                <div className="report-upload-intro">
                  <span className="upload-card-icon">
                    <UploadCloud size={20} />
                  </span>
                  <div>
                    <h2>Submit a report</h2>
                    <p>
                      Attach PDF, office documents, spreadsheets, images, or
                      text files.
                    </p>
                  </div>
                </div>
                <form className="report-page-form" onSubmit={submitReport}>
                  <label>
                    Report type
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                    >
                      <option>Daily report</option>
                      <option>Monthly report</option>
                      <option>Site observation</option>
                      <option>Other document</option>
                    </select>
                  </label>
                  <label>
                    Notes
                    <textarea
                      value={reportNote}
                      onChange={(e) => setReportNote(e.target.value)}
                      placeholder="Summary of site activities, blockers, safety notes…"
                      rows="4"
                    />
                  </label>
                  <label className="report-dropzone">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png,.webp,.zip"
                      onChange={(e) =>
                        setReportFile(e.target.files?.[0] || null)
                      }
                    />
                    <UploadCloud size={22} />
                    <strong>
                      {reportFile ? reportFile.name : "Choose a report file"}
                    </strong>
                    <span>
                      Most common document, image, spreadsheet and text formats
                    </span>
                  </label>
                  <button className="primary-button" type="submit">
                    <Plus size={16} /> Submit report
                  </button>
                </form>
              </section>
              <section className="content-card history-card">
                <div className="card-heading">
                  <div>
                    <h2>Report history</h2>
                    <p>Submitted reports and review status</p>
                  </div>
                </div>
                {reportError && <div className="form-error">{reportError}</div>}
                {reportHistory.length ? <div className="report-history-list">
                  {reportHistory.map(report => <div className="report-history-row" key={report.id}>
                    <div><strong>{report.report_type}</strong><small>File type: {(report.file_name || "").split(".").pop()?.toUpperCase() || "FILE"} · Submitted by: {report.submitter}</small></div>
                    <span className={`report-status-text status-${report.status}`}>{report.status === "pending" ? "Pending review" : report.status === "accepted" ? "Accepted" : "Rejected"}<br/>{prettyDate(report.created_at)}</span>
                    <button type="button" className="secondary-button" onClick={() => {setSelectedReport(report);setEditedExtractedText(report.extracted_text || "");setEditingExtracted(false);}}>{report.status === "pending" ? "Review" : "See details"}</button>
                  </div>)}
                </div> : <div className="history-empty"><span><FileText size={22}/></span><strong>No reports submitted yet</strong><p>Submit a report to see it here and review its extracted details.</p></div>}
                {selectedReport && <div className={`report-drawer-backdrop ${selectedReport.status === "pending" ? "report-review-modal-backdrop" : ""}`} onClick={() => setSelectedReport(null)}>
                  <aside className={`report-drawer ${selectedReport.status === "pending" ? "report-review-modal" : ""}`} onClick={e => e.stopPropagation()}>
                    <button className="drawer-close" onClick={() => setSelectedReport(null)} aria-label="Close details"><X size={20}/></button>
                    <div className="eyebrow-label">{selectedReport.status === "pending" ? "HUMAN VERIFICATION" : "REPORT DETAILS"}</div><h2>{selectedReport.report_type}</h2>
                    <p><strong>Submitted by:</strong> {selectedReport.submitter}</p><p><strong>Date:</strong> {prettyDate(selectedReport.created_at)}</p>
                    {selectedReport.status !== "pending" && <p><strong>Status:</strong> {selectedReport.status}</p>}
                    <h3>Extracted details</h3>
                    {editingExtracted ? <textarea className="extracted-edit-area" value={editedExtractedText} onChange={e => setEditedExtractedText(e.target.value)} aria-label="Edit extracted details" /> : <div className="extracted-details">{selectedReport.extracted_text || "No text could be extracted automatically from this file."}</div>}
                    <div className="drawer-review-actions edit-detail-actions"><button className="secondary-button" type="button" onClick={() => editingExtracted ? saveExtractedDetails() : (setEditedExtractedText(selectedReport.extracted_text || ""), setEditingExtracted(true))}>{editingExtracted ? "Save edits" : "Edit extracted details"}</button>{editingExtracted && <button className="cancel-button" type="button" onClick={() => {setEditingExtracted(false);setEditedExtractedText(selectedReport.extracted_text || "");}}>Cancel edit</button>}</div>
                    {selectedReport.status === "pending" && <div className="drawer-review-actions review-decision-actions"><button className="primary-button" onClick={() => reviewReport(selectedReport,"accepted")}>Accept</button><button className="cancel-button" onClick={() => reviewReport(selectedReport,"rejected")}>Reject</button></div>}
                    {selectedReport.status !== "pending" && <button className="cancel-button drawer-close-bottom" onClick={() => {setSelectedReport(null);setEditingExtracted(false);}}>Close details</button>}
                  </aside>
                </div>}
              </section>
              </div>
            </>
          ) : section === "3D Visualization" ? (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow-label">SITE MODEL WORKSPACE</div>
                  <h1>3D Visualization</h1>
                  <p>
                    Upload a reference image of your building or site, then
                    configure colored utility layers.
                  </p>
                </div>
                <span className="section-counter">Model viewer · Preview</span>
              </div>
              <section className="content-card model-upload-card">
                <div className="model-upload-copy">
                  <span className="upload-card-icon">
                    <Building2 size={20} />
                  </span>
                  <div>
                    <h2>1. Add your project image</h2>
                    <p>
                      Choose a building render, site photograph, floor plan, or
                      model screenshot. It will appear in the viewer below.
                    </p>
                  </div>
                </div>
                <label className="model-file-picker">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setModelImage(e.target.files?.[0] || null)}
                  />
                  <UploadCloud size={20} />
                  <span>
                    <strong>
                      {modelImage ? modelImage.name : "Choose project image"}
                    </strong>
                    <small>
                      PNG, JPG, WEBP or another browser-supported image
                    </small>
                  </span>
                  <span className="secondary-button">Browse files</span>
                </label>
                {modelImage && (
                  <button
                    className="clear-model-button"
                    type="button"
                    onClick={() => setModelImage(null)}
                  >
                    <X size={14} /> Remove image
                  </button>
                )}
              </section>
              <div className="model-workspace-grid">
                <section className="content-card model-viewer-card">
                  <div className="card-heading">
                    <div>
                      <h2>Site model preview</h2>
                      <p>
                        {modelImage
                          ? "Your uploaded reference with configurable utility overlays"
                          : "Upload an image to begin your site visualization"}
                      </p>
                    </div>
                    <span className="preview-chip">2D IMAGE PREVIEW</span>
                  </div>
                  <div
                    className={`model-canvas ${modelImageUrl ? "has-model-image" : ""}`}
                  >
                    {modelImageUrl ? (
                      <>
                        <img
                          className="model-reference-image"
                          src={modelImageUrl}
                          alt="Uploaded project reference"
                        />
                        {showPipes && (
                          <svg
                            className="model-overlay"
                            viewBox="0 0 800 460"
                            preserveAspectRatio="none"
                            aria-label="Piping layer overlay"
                          >
                            <path
                              d="M80 320 L230 270 L360 300 L480 205 L690 235 M230 270 L230 150 L410 115 L480 205 M360 300 L360 365 L560 330"
                              fill="none"
                              stroke={pipeColor}
                              strokeWidth="7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeDasharray="14 7"
                            />
                            <circle cx="230" cy="270" r="10" fill={pipeColor} />
                            <circle cx="480" cy="205" r="10" fill={pipeColor} />
                          </svg>
                        )}
                        {showElectrical && (
                          <svg
                            className="model-overlay"
                            viewBox="0 0 800 460"
                            preserveAspectRatio="none"
                            aria-label="Electrical layer overlay"
                          >
                            <path
                              d="M110 120 L290 180 L420 155 L610 105 M290 180 L330 250 L510 270 L690 360"
                              fill="none"
                              stroke={electricalColor}
                              strokeWidth="5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeDasharray="5 9"
                            />
                            <circle
                              cx="290"
                              cy="180"
                              r="8"
                              fill={electricalColor}
                            />
                            <circle
                              cx="510"
                              cy="270"
                              r="8"
                              fill={electricalColor}
                            />
                          </svg>
                        )}
                        {showProgress && (
                          <div className="model-progress-tag">
                            <span /> Progress overlay · illustrative
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="model-empty-state">
                        <span className="model-empty-icon">
                          <Box size={34} />
                        </span>
                        <strong>Your project model starts here</strong>
                        <p>
                          Upload a building or site image above. Colored
                          overlays can help mark piping, electrical routes, and
                          progress zones.
                        </p>
                        <span className="model-empty-hint">
                          <UploadCloud size={15} /> JPG · PNG · WEBP
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="model-viewer-foot">
                    <span>
                      <i className="model-dot pipe-dot" /> Piping
                    </span>
                    <span>
                      <i className="model-dot electrical-dot" /> Electrical
                    </span>
                    <span>
                      <i className="model-dot progress-dot" /> Progress zone
                    </span>
                    <small>
                      Overlay paths are illustrative, not engineering-accurate.
                    </small>
                  </div>
                </section>
                <aside className="content-card model-layers-card">
                  <div className="card-heading">
                    <div>
                      <h2>2. Visualization layers</h2>
                      <p>Choose which site systems to display</p>
                    </div>
                    <span className="layer-icon">
                      <Settings size={17} />
                    </span>
                  </div>
                  <div className="layer-control">
                    <label className="layer-toggle">
                      <input
                        type="checkbox"
                        checked={showPipes}
                        onChange={(e) => setShowPipes(e.target.checked)}
                      />
                      <span
                        className="layer-swatch"
                        style={{ background: pipeColor }}
                      />
                      <span>
                        <strong>Piping / plumbing</strong>
                        <small>Water and pipeline routes</small>
                      </span>
                    </label>
                    <label className="color-control">
                      Layer color{" "}
                      <input
                        type="color"
                        value={pipeColor}
                        onChange={(e) => setPipeColor(e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="layer-control">
                    <label className="layer-toggle">
                      <input
                        type="checkbox"
                        checked={showElectrical}
                        onChange={(e) => setShowElectrical(e.target.checked)}
                      />
                      <span
                        className="layer-swatch"
                        style={{ background: electricalColor }}
                      />
                      <span>
                        <strong>Electrical</strong>
                        <small>Electrical route markers</small>
                      </span>
                    </label>
                    <label className="color-control">
                      Layer color{" "}
                      <input
                        type="color"
                        value={electricalColor}
                        onChange={(e) => setElectricalColor(e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="layer-control">
                    <label className="layer-toggle">
                      <input
                        type="checkbox"
                        checked={showProgress}
                        onChange={(e) => setShowProgress(e.target.checked)}
                      />
                      <span className="layer-swatch progress-swatch" />
                      <span>
                        <strong>Progress overlay</strong>
                        <small>Show progress indicator</small>
                      </span>
                    </label>
                  </div>
                  <div className="model-next-step">
                    <Sparkles size={17} />
                    <div>
                      <strong>Next phase: true 3D model</strong>
                      <p>
                        We can later add a 3D viewer for IFC, GLB or GLTF
                        models, selectable building components, and accurate
                        utility routes.
                      </p>
                    </div>
                  </div>
                </aside>
              </div>
              <div className="model-disclaimer">
                <Info size={15} /> This is an image-based visualization
                prototype. It does not yet interpret building geometry or place
                utility routes automatically. Layer colors and visibility are
                interactive.
              </div>
            </>
          ) : (
            <section className="content-card section-placeholder">
              <span className="placeholder-icon">{navIcon(section)}</span>
              <span className="eyebrow-label">WORKSPACE MODULE</span>
              <h1>{section}</h1>
              <p>
                {section === "AI Verification"
                  ? "Review document checks, progress anomalies, and AI-supported recommendations."
                  : section === "3D Visualization"
                    ? "A future space for interactive 3D models, site layers, and progress overlays."
                    : section === "Issues & Constraints"
                      ? "Track blockers, impact levels, owners, and mitigation actions."
                      : "Workspace preferences and project configuration will live here."}
              </p>
              <div className="module-preview-grid">
                <div>
                  <Check size={17} />
                  <strong>Navigation ready</strong>
                  <span>This module is included in the workspace sidebar.</span>
                </div>
                <div>
                  <Wrench size={17} />
                  <strong>Next implementation phase</strong>
                  <span>
                    Forms, saved data, permissions, and integrations will be
                    connected later.
                  </span>
                </div>
              </div>
              <button
                className="secondary-button"
                onClick={() => setSection("Dashboard")}
              >
                <ArrowLeft size={15} /> Return to dashboard
              </button>
            </section>
          )}
        </div>
      </main>
      {toast && (
        <div className="toast">
          <Check size={16} />
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
