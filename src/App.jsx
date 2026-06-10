import { useState, useEffect } from "react";

const STORAGE_KEY = "pf_projects";

function loadProjects() {
  try {
    const d = localStorage.getItem(STORAGE_KEY);
    return d ? JSON.parse(d) : [];
  } catch {
    return [];
  }
}

function pct(project) {
  if (!project.features.length) return 0;
  return Math.round(
    (project.features.filter((f) => f.completed).length /
      project.features.length) *
      100
  );
}

export default function App() {
  const [projects, setProjects] = useState(loadProjects);
  const [view, setView] = useState("home");
  const [selected, setSelected] = useState(null);

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [feature, setFeature] = useState("");
  const [task, setTask] = useState("");
  const [phase, setPhase] = useState("");
  const [notes, setNotes] = useState("");
  const [tableName, setTableName] = useState("");
  const [columnName, setColumnName] = useState("");
  const [selectedTable, setSelectedTable] = useState(null);
  const [search, setSearch] = useState("");
  const [section, setSection] = useState("features");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch {}
  }, [projects]);

  const updateProjects = (updated) => {
    setProjects(updated);
    if (selected) {
      setSelected(updated.find((p) => p.id === selected.id) ?? null);
    }
  };

  const updateProject = (id, fn) => {
    updateProjects(projects.map((p) => (p.id === id ? fn(p) : p)));
  };

  const logActivity = (p, action, text) => ({
    ...p,
    activity: [...(p.activity || []), { id: Date.now(), action, text }],
  });

  const createProject = () => {
    if (!name.trim()) return;
    const p = {
      id: Date.now(),
      name: name.trim(),
      description: desc.trim(),
      features: [],
      tasks: [],
      notes: "",
      roadmap: [],
      database: [],
      activity: [],
    };
    setProjects((prev) => [...prev, p]);
    setName("");
    setDesc("");
  };

  const deleteProject = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (selected?.id === id) {
      setSelected(null);
      setView("home");
    }
  };

  const openProject = (project) => {
    setSelected(project);
    setNotes(project.notes || "");
    setSelectedTable(null);
    setSection("features");
    setView("project");
  };

  // Features
  const addFeature = () => {
    if (!feature.trim()) return;
    const title = feature.trim();
    updateProject(selected.id, (p) =>
      logActivity(
        { ...p, features: [...p.features, { id: Date.now(), title, completed: false }] },
        "Added Feature",
        title
      )
    );
    setFeature("");
  };

  const toggleFeature = (fid) => {
    updateProject(selected.id, (p) => ({
      ...p,
      features: p.features.map((f) =>
        f.id === fid ? { ...f, completed: !f.completed } : f
      ),
    }));
  };

  const deleteFeature = (fid) => {
    updateProject(selected.id, (p) =>
      logActivity(
        { ...p, features: p.features.filter((f) => f.id !== fid) },
        "Deleted Feature",
        p.features.find((f) => f.id === fid)?.title || ""
      )
    );
  };

  // Roadmap
  const addPhase = () => {
    if (!phase.trim()) return;
    updateProject(selected.id, (p) => ({
      ...p,
      roadmap: [...(p.roadmap ?? []), { id: Date.now(), title: phase.trim(), completed: false }],
    }));
    setPhase("");
  };

  const togglePhase = (rid) => {
    updateProject(selected.id, (p) => ({
      ...p,
      roadmap: p.roadmap.map((r) => (r.id === rid ? { ...r, completed: !r.completed } : r)),
    }));
  };

  const deletePhase = (rid) => {
    updateProject(selected.id, (p) => ({
      ...p,
      roadmap: p.roadmap.filter((r) => r.id !== rid),
    }));
  };

  // Tasks
  const addTask = () => {
    if (!task.trim()) return;
    const title = task.trim();
    updateProject(selected.id, (p) =>
      logActivity(
        { ...p, tasks: [...p.tasks, { id: Date.now(), title, status: "todo" }] },
        "Added Task",
        title
      )
    );
    setTask("");
  };

  const updateTaskStatus = (tid, status) => {
    updateProject(selected.id, (p) => ({
      ...p,
      tasks: p.tasks.map((t) => (t.id === tid ? { ...t, status } : t)),
    }));
  };

  const deleteTask = (tid) => {
    updateProject(selected.id, (p) =>
      logActivity(
        { ...p, tasks: p.tasks.filter((t) => t.id !== tid) },
        "Deleted Task",
        p.tasks.find((t) => t.id === tid)?.title || ""
      )
    );
  };

  // Notes
  const saveNotes = () => {
    updateProject(selected.id, (p) => ({ ...p, notes }));
  };

  // Database
  const addTable = () => {
    if (!tableName.trim()) return;
    updateProject(selected.id, (p) => ({
      ...p,
      database: [...(p.database ?? []), { id: Date.now(), name: tableName.trim(), columns: [] }],
    }));
    setTableName("");
  };

  const deleteTable = (tableId) => {
    updateProject(selected.id, (p) => ({
      ...p,
      database: p.database.filter((t) => t.id !== tableId),
    }));
    if (selectedTable === tableId) setSelectedTable(null);
  };

  const addColumn = () => {
    if (!columnName.trim() || !selectedTable) return;
    updateProject(selected.id, (p) => ({
      ...p,
      database: p.database.map((table) =>
        table.id === selectedTable
          ? { ...table, columns: [...table.columns, columnName.trim()] }
          : table
      ),
    }));
    setColumnName("");
  };

  const exportProject = () => {
    const data = JSON.stringify(selected, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selected.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── styles ────────────────────────────────────────────────────
  const s = {
    page: {
      background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
      minHeight: "100vh",
      color: "#f1f5f9",
      fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
      fontSize: 14,
    },
    container: { maxWidth: 760, margin: "0 auto", padding: "40px 24px" },
    card: {
      background: "rgba(30, 41, 59, 0.85)",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(71, 85, 105, 0.4)",
      borderRadius: 16,
      padding: "24px 28px",
      marginBottom: 20,
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: 700,
      color: "#818cf8",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      marginBottom: 14,
    },
    input: {
      background: "rgba(15, 23, 42, 0.8)",
      border: "1px solid rgba(71, 85, 105, 0.5)",
      borderRadius: 10,
      padding: "11px 14px",
      color: "#f1f5f9",
      fontSize: 14,
      outline: "none",
      width: "100%",
      transition: "border-color 0.2s, box-shadow 0.2s",
    },
    btnPrimary: {
      background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
      color: "#fff",
      border: "none",
      borderRadius: 10,
      padding: "10px 18px",
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      whiteSpace: "nowrap",
      boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
      transition: "transform 0.15s, box-shadow 0.15s",
    },
    btnGhost: {
      background: "transparent",
      color: "#a5b4fc",
      border: "1px solid rgba(99, 102, 241, 0.4)",
      borderRadius: 10,
      padding: "8px 16px",
      fontSize: 13,
      cursor: "pointer",
      transition: "background 0.15s, border-color 0.15s",
    },
    btnSecondary: {
      background: "rgba(71, 85, 105, 0.5)",
      color: "#e2e8f0",
      border: "none",
      borderRadius: 8,
      padding: "7px 14px",
      fontSize: 12,
      cursor: "pointer",
      transition: "background 0.15s",
    },
    btnDanger: {
      background: "rgba(127, 29, 29, 0.7)",
      color: "#fca5a5",
      border: "none",
      borderRadius: 8,
      padding: "6px 12px",
      fontSize: 12,
      cursor: "pointer",
      transition: "background 0.15s",
    },
    btnIcon: {
      background: "transparent",
      border: "none",
      color: "#64748b",
      cursor: "pointer",
      padding: "4px 8px",
      borderRadius: 6,
      fontSize: 14,
      transition: "color 0.15s, background 0.15s",
    },
    row: { display: "flex", gap: 10, alignItems: "center" },
    progressTrack: {
      height: 8,
      background: "rgba(51, 65, 85, 0.6)",
      borderRadius: 4,
      overflow: "hidden",
    },
    featureRow: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 16px",
      background: "rgba(15, 23, 42, 0.6)",
      borderRadius: 12,
      marginBottom: 10,
      border: "1px solid rgba(71, 85, 105, 0.3)",
      transition: "border-color 0.15s, background 0.15s",
    },
    taskCard: {
      background: "rgba(15, 23, 42, 0.7)",
      borderRadius: 10,
      padding: "12px 14px",
      marginBottom: 10,
      border: "1px solid rgba(71, 85, 105, 0.3)",
    },
    kanbanCol: {
      background: "rgba(22, 32, 50, 0.8)",
      border: "1px solid rgba(30, 41, 59, 0.6)",
      borderRadius: 14,
      padding: 16,
      flex: 1,
      minWidth: 0,
    },
  };

  // ── PROJECT VIEW ──────────────────────────────────────────────
  if (view === "project" && selected) {
    const progress = pct(selected);
    const selectedTableObj = selected.database?.find((t) => t.id === selectedTable);
    const selectedTableName = selectedTableObj?.name ?? null;

    const statuses = [
      { key: "todo", label: "To do", dot: "#64748b" },
      { key: "doing", label: "In progress", dot: "#fbbf24" },
      { key: "done", label: "Done", dot: "#34d399" },
    ];

    const navItems = [
      { key: "features", label: "Features" },
      { key: "roadmap", label: "Roadmap" },
      { key: "tasks", label: "Tasks" },
      { key: "notes", label: "Notes" },
      { key: "database", label: "Database" },
      { key: "activity", label: "Activity" },
    ];

    return (
      <div style={{ ...s.page, display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <div
          style={{
            width: 240,
            flexShrink: 0,
            background: "linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)",
            borderRight: "1px solid rgba(71, 85, 105, 0.3)",
            padding: "28px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 700,
                color: "#fff",
                boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
              }}
            >
              PF
            </div>
            <span style={{ fontWeight: 700, fontSize: 17, color: "#f1f5f9" }}>ProjectForge</span>
          </div>

          {/* Back */}
          <button
            style={{ ...s.btnGhost, textAlign: "left", marginBottom: 16, fontSize: 13 }}
            onClick={() => setView("home")}
            onMouseOver={(e) => (e.currentTarget.style.background = "rgba(99, 102, 241, 0.15)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
          >
            &larr; Dashboard
          </button>

          {/* Project name */}
          <p
            style={{
              fontSize: 10,
              color: "#6366f1",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              margin: "8px 0 10px 4px",
            }}
          >
            Project
          </p>
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#e2e8f0",
              padding: "0 4px",
              marginBottom: 16,
              lineHeight: 1.5,
            }}
          >
            {selected.name}
          </p>

          {/* Nav */}
          <p
            style={{
              fontSize: 10,
              color: "#6366f1",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              margin: "8px 0 10px 4px",
            }}
          >
            Sections
          </p>
          {navItems.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSection(key)}
              style={{
                background: section === key ? "rgba(99, 102, 241, 0.2)" : "transparent",
                color: section === key ? "#a5b4fc" : "#94a3b8",
                border: "none",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 13,
                cursor: "pointer",
                textAlign: "left",
                fontWeight: section === key ? 600 : 400,
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseOver={(e) => {
                if (section !== key) e.currentTarget.style.background = "rgba(99, 102, 241, 0.1)";
              }}
              onMouseOut={(e) => {
                if (section !== key) e.currentTarget.style.background = "transparent";
              }}
            >
              {label}
            </button>
          ))}

          {/* Export at bottom */}
          <div style={{ marginTop: "auto", paddingTop: 28 }}>
            <button
              style={{ ...s.btnSecondary, width: "100%" }}
              onClick={exportProject}
              onMouseOver={(e) => (e.currentTarget.style.background = "rgba(71, 85, 105, 0.7)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "rgba(71, 85, 105, 0.5)")}
            >
              Export JSON
            </button>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", padding: "36px 28px" }}>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
              >
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
                    {selected.name}
                  </h1>
                  {selected.description && (
                    <p style={{ color: "#94a3b8", marginTop: 6, fontSize: 14, lineHeight: 1.5 }}>
                      {selected.description}
                    </p>
                  )}
                </div>
                <span
                  style={{
                    background:
                      progress === 100
                        ? "linear-gradient(135deg, #065f46 0%, #047857 100%)"
                        : "linear-gradient(135deg, #1e3a5f 0%, #312e81 100%)",
                    color: progress === 100 ? "#6ee7b7" : "#a5b4fc",
                    borderRadius: 24,
                    padding: "6px 18px",
                    fontSize: 14,
                    fontWeight: 700,
                    flexShrink: 0,
                    marginLeft: 16,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                  }}
                >
                  {progress}%
                </span>
              </div>
              <div style={{ ...s.progressTrack, marginTop: 18 }}>
                <div
                  style={{
                    width: `${progress}%`,
                    height: "100%",
                    background:
                      progress === 100
                        ? "linear-gradient(90deg, #10b981 0%, #34d399 100%)"
                        : "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)",
                    transition: "width 0.4s ease",
                    borderRadius: 4,
                  }}
                />
              </div>
            </div>

            {/* Features */}
            {section === "features" && (
              <div style={s.card}>
                <p style={s.sectionLabel}>Features</p>
                <div style={{ ...s.row, marginBottom: 16 }}>
                  <input
                    style={s.input}
                    value={feature}
                    onChange={(e) => setFeature(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addFeature()}
                    placeholder="Add a feature…"
                    onFocus={(e) => {
                      e.target.style.borderColor = "#6366f1";
                      e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.15)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(71, 85, 105, 0.5)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    style={s.btnPrimary}
                    onClick={addFeature}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 6px 20px rgba(99, 102, 241, 0.5)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 14px rgba(99, 102, 241, 0.4)";
                    }}
                  >
                    Add
                  </button>
                </div>
                {selected.features.length === 0 && (
                  <p style={{ color: "#64748b", fontSize: 13, fontStyle: "italic" }}>
                    No features yet. Add your first feature above.
                  </p>
                )}
                {selected.features.map((f) => (
                  <div
                    key={f.id}
                    style={s.featureRow}
                    onMouseOver={(e) => (e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.5)")}
                    onMouseOut={(e) => (e.currentTarget.style.borderColor = "rgba(71, 85, 105, 0.3)")}
                  >
                    <input
                      type="checkbox"
                      checked={f.completed}
                      onChange={() => toggleFeature(f.id)}
                      style={{ accentColor: "#6366f1", cursor: "pointer", width: 18, height: 18 }}
                    />
                    <span
                      style={{
                        flex: 1,
                        fontSize: 14,
                        textDecoration: f.completed ? "line-through" : "none",
                        color: f.completed ? "#64748b" : "#f1f5f9",
                      }}
                    >
                      {f.title}
                    </span>
                    <button
                      style={s.btnIcon}
                      onClick={() => deleteFeature(f.id)}
                      title="Delete feature"
                      onMouseOver={(e) => {
                        e.currentTarget.style.color = "#f87171";
                        e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.color = "#64748b";
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Roadmap */}
            {section === "roadmap" && (
              <div style={s.card}>
                <p style={s.sectionLabel}>Roadmap</p>
                <div style={{ ...s.row, marginBottom: 16 }}>
                  <input
                    style={s.input}
                    value={phase}
                    onChange={(e) => setPhase(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addPhase()}
                    placeholder="Add a phase…"
                    onFocus={(e) => {
                      e.target.style.borderColor = "#6366f1";
                      e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.15)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(71, 85, 105, 0.5)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    style={s.btnPrimary}
                    onClick={addPhase}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 6px 20px rgba(99, 102, 241, 0.5)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 14px rgba(99, 102, 241, 0.4)";
                    }}
                  >
                    Add
                  </button>
                </div>
                {(!selected.roadmap || selected.roadmap.length === 0) && (
                  <p style={{ color: "#64748b", fontSize: 13, fontStyle: "italic" }}>
                    No phases yet. Plan your roadmap above.
                  </p>
                )}
                {(selected.roadmap ?? []).map((rm, i) => (
                  <div
                    key={rm.id}
                    style={s.featureRow}
                    onMouseOver={(e) => (e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.5)")}
                    onMouseOut={(e) => (e.currentTarget.style.borderColor = "rgba(71, 85, 105, 0.3)")}
                  >
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: rm.completed
                          ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                          : "rgba(51, 65, 85, 0.8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        color: rm.completed ? "#fff" : "#94a3b8",
                        flexShrink: 0,
                        cursor: "pointer",
                        fontWeight: 600,
                        boxShadow: rm.completed ? "0 2px 8px rgba(99, 102, 241, 0.4)" : "none",
                      }}
                      onClick={() => togglePhase(rm.id)}
                    >
                      {rm.completed ? "✓" : i + 1}
                    </div>
                    <span
                      style={{
                        flex: 1,
                        fontSize: 14,
                        textDecoration: rm.completed ? "line-through" : "none",
                        color: rm.completed ? "#64748b" : "#f1f5f9",
                      }}
                    >
                      {rm.title}
                    </span>
                    <input
                      type="checkbox"
                      checked={rm.completed}
                      onChange={() => togglePhase(rm.id)}
                      style={{ accentColor: "#6366f1", cursor: "pointer", width: 18, height: 18 }}
                    />
                    <button
                      style={s.btnIcon}
                      onClick={() => deletePhase(rm.id)}
                      title="Delete phase"
                      onMouseOver={(e) => {
                        e.currentTarget.style.color = "#f87171";
                        e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.color = "#64748b";
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Tasks */}
            {section === "tasks" && (
              <div style={s.card}>
                <p style={s.sectionLabel}>Tasks</p>
                <div style={{ ...s.row, marginBottom: 18 }}>
                  <input
                    style={s.input}
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                    placeholder="Add a task…"
                    onFocus={(e) => {
                      e.target.style.borderColor = "#6366f1";
                      e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.15)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(71, 85, 105, 0.5)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    style={s.btnPrimary}
                    onClick={addTask}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 6px 20px rgba(99, 102, 241, 0.5)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 14px rgba(99, 102, 241, 0.4)";
                    }}
                  >
                    Add
                  </button>
                </div>
                <div style={{ display: "flex", gap: 14 }}>
                  {statuses.map(({ key, label, dot }) => (
                    <div key={key} style={s.kanbanCol}>
                      <div
                        style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}
                      >
                        <div
                          style={{ width: 8, height: 8, borderRadius: "50%", background: dot }}
                        />
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#94a3b8",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                          }}
                        >
                          {label}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: "#64748b",
                            background: "rgba(51, 65, 85, 0.6)",
                            borderRadius: 10,
                            padding: "2px 8px",
                          }}
                        >
                          {selected.tasks.filter((t) => t.status === key).length}
                        </span>
                      </div>
                      {selected.tasks
                        .filter((t) => t.status === key)
                        .map((t) => (
                          <div key={t.id} style={s.taskCard}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                marginBottom: 10,
                              }}
                            >
                              <p style={{ fontSize: 13, margin: 0, flex: 1, lineHeight: 1.4 }}>
                                {t.title}
                              </p>
                              <button
                                style={{ ...s.btnIcon, padding: "2px 6px", fontSize: 12 }}
                                onClick={() => deleteTask(t.id)}
                                title="Delete task"
                                onMouseOver={(e) => {
                                  e.currentTarget.style.color = "#f87171";
                                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.color = "#64748b";
                                  e.currentTarget.style.background = "transparent";
                                }}
                              >
                                &times;
                              </button>
                            </div>
                            <select
                              value={t.status}
                              onChange={(e) => updateTaskStatus(t.id, e.target.value)}
                              style={{
                                width: "100%",
                                background: "rgba(30, 41, 59, 0.8)",
                                border: "1px solid rgba(71, 85, 105, 0.4)",
                                borderRadius: 8,
                                padding: "6px 10px",
                                color: "#f1f5f9",
                                fontSize: 12,
                                cursor: "pointer",
                              }}
                            >
                              <option value="todo">To do</option>
                              <option value="doing">In progress</option>
                              <option value="done">Done</option>
                            </select>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {section === "notes" && (
              <div style={s.card}>
                <p style={s.sectionLabel}>Notes</p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Write project notes, decisions, links…"
                  rows={12}
                  style={{
                    ...s.input,
                    resize: "vertical",
                    lineHeight: 1.7,
                    fontFamily: "inherit",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#6366f1";
                    e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(71, 85, 105, 0.5)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                  <button
                    style={s.btnPrimary}
                    onClick={saveNotes}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 6px 20px rgba(99, 102, 241, 0.5)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 14px rgba(99, 102, 241, 0.4)";
                    }}
                  >
                    Save notes
                  </button>
                </div>
              </div>
            )}

            {/* Database */}
            {section === "database" && (
              <div style={s.card}>
                <p style={s.sectionLabel}>Database Designer</p>
                <div style={{ ...s.row, marginBottom: 18 }}>
                  <input
                    style={s.input}
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTable()}
                    placeholder="Table name…"
                    onFocus={(e) => {
                      e.target.style.borderColor = "#6366f1";
                      e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.15)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(71, 85, 105, 0.5)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    style={s.btnPrimary}
                    onClick={addTable}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 6px 20px rgba(99, 102, 241, 0.5)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 14px rgba(99, 102, 241, 0.4)";
                    }}
                  >
                    Add Table
                  </button>
                </div>
                {(!selected.database || selected.database.length === 0) && (
                  <p style={{ color: "#64748b", fontSize: 13, marginBottom: 14, fontStyle: "italic" }}>
                    No tables yet. Create your first table above.
                  </p>
                )}
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
                  {(selected.database ?? []).map((table) => (
                    <div
                      key={table.id}
                      style={{
                        background: "rgba(15, 23, 42, 0.7)",
                        border: `2px solid ${selectedTable === table.id ? "#6366f1" : "rgba(71, 85, 105, 0.4)"}`,
                        borderRadius: 14,
                        padding: "16px 20px",
                        minWidth: 200,
                        boxShadow:
                          selectedTable === table.id
                            ? "0 4px 20px rgba(99, 102, 241, 0.25)"
                            : "0 2px 10px rgba(0,0,0,0.2)",
                        transition: "border-color 0.2s, box-shadow 0.2s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 10,
                        }}
                      >
                        <p style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>{table.name}</p>
                        <button
                          style={{ ...s.btnIcon, padding: "2px 6px", fontSize: 12 }}
                          onClick={() => deleteTable(table.id)}
                          title="Delete table"
                          onMouseOver={(e) => {
                            e.currentTarget.style.color = "#f87171";
                            e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.color = "#64748b";
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          &times;
                        </button>
                      </div>
                      {table.columns.length === 0 && (
                        <p style={{ color: "#64748b", fontSize: 12, fontStyle: "italic" }}>
                          No columns yet.
                        </p>
                      )}
                      {table.columns.map((col, i) => (
                        <p
                          key={i}
                          style={{
                            fontSize: 13,
                            color: "#a5b4fc",
                            padding: "5px 0",
                            borderTop: "1px solid rgba(71, 85, 105, 0.3)",
                          }}
                        >
                          &bull; {col}
                        </p>
                      ))}
                      <button
                        style={{
                          ...s.btnSecondary,
                          marginTop: 12,
                          width: "100%",
                          background:
                            selectedTable === table.id
                              ? "rgba(99, 102, 241, 0.3)"
                              : "rgba(71, 85, 105, 0.5)",
                          color: selectedTable === table.id ? "#a5b4fc" : "#e2e8f0",
                        }}
                        onClick={() => setSelectedTable(table.id === selectedTable ? null : table.id)}
                      >
                        {selectedTable === table.id ? "Selected" : "Select"}
                      </button>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 12 }}>
                  Selected table:{" "}
                  <span style={{ color: "#a5b4fc", fontWeight: 600 }}>
                    {selectedTableName ?? "None"}
                  </span>
                </p>
                <div style={s.row}>
                  <input
                    style={{ ...s.input, opacity: selectedTable ? 1 : 0.5 }}
                    value={columnName}
                    onChange={(e) => setColumnName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addColumn()}
                    placeholder={selectedTable ? "Column name…" : "Select a table first"}
                    disabled={!selectedTable}
                    onFocus={(e) => {
                      if (selectedTable) {
                        e.target.style.borderColor = "#6366f1";
                        e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.15)";
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(71, 85, 105, 0.5)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    style={{ ...s.btnPrimary, opacity: selectedTable ? 1 : 0.4 }}
                    onClick={addColumn}
                    disabled={!selectedTable}
                  >
                    Add Column
                  </button>
                </div>
              </div>
            )}

            {/* Activity */}
            {section === "activity" && (
              <div style={s.card}>
                <p style={s.sectionLabel}>Recent Activity</p>
                {(selected.activity || []).length === 0 && (
                  <p style={{ color: "#64748b", fontSize: 13, fontStyle: "italic" }}>
                    No activity yet.
                  </p>
                )}
                {(selected.activity || [])
                  .slice()
                  .reverse()
                  .slice(0, 20)
                  .map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 0",
                        borderBottom: "1px solid rgba(71, 85, 105, 0.3)",
                        fontSize: 13,
                      }}
                    >
                      <span
                        style={{
                          background: "linear-gradient(135deg, #1e3a5f 0%, #312e81 100%)",
                          color: "#a5b4fc",
                          borderRadius: 6,
                          padding: "4px 10px",
                          fontSize: 11,
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.action}
                      </span>
                      <span style={{ color: "#94a3b8" }}>{item.text}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── HOME VIEW ─────────────────────────────────────────────────
  const totalProjects = projects.length;
  const totalFeatures = projects.reduce((sum, p) => sum + p.features.length, 0);
  const completedFeatures = projects.reduce(
    (sum, p) => sum + p.features.filter((f) => f.completed).length,
    0
  );
  const totalTasks = projects.reduce((sum, p) => sum + p.tasks.length, 0);
  const completedTasks = projects.reduce(
    (sum, p) => sum + p.tasks.filter((t) => t.status === "done").length,
    0
  );

  const completionRate =
    totalFeatures === 0 ? 0 : Math.round((completedFeatures / totalFeatures) * 100);

  const stats = [
    { label: "Projects", value: totalProjects },
    { label: "Features", value: totalFeatures },
    { label: "Features done", value: completedFeatures },
    { label: "Tasks", value: totalTasks },
    { label: "Tasks done", value: completedTasks },
    { label: "Completion", value: `${completionRate}%` },
  ];

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={s.page}>
      <div style={s.container}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 10 }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 700,
                color: "#fff",
                boxShadow: "0 6px 20px rgba(99, 102, 241, 0.4)",
              }}
            >
              PF
            </div>
            <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>
              ProjectForge
            </span>
          </div>
          <p style={{ color: "#94a3b8", fontSize: 15 }}>
            Create and manage your software projects
          </p>
        </div>

        {/* New project */}
        <div style={s.card}>
          <p style={s.sectionLabel}>New project</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              style={s.input}
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createProject()}
              onFocus={(e) => {
                e.target.style.borderColor = "#6366f1";
                e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(71, 85, 105, 0.5)";
                e.target.style.boxShadow = "none";
              }}
            />
            <textarea
              style={{ ...s.input, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }}
              placeholder="Short description (optional)"
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              onFocus={(e) => {
                e.target.style.borderColor = "#6366f1";
                e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(71, 85, 105, 0.5)";
                e.target.style.boxShadow = "none";
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                style={s.btnPrimary}
                onClick={createProject}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(99, 102, 241, 0.5)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 14px rgba(99, 102, 241, 0.4)";
                }}
              >
                + Create project
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        {totalProjects > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 14,
              marginBottom: 28,
            }}
          >
            {stats.map(({ label, value }) => (
              <div
                key={label}
                style={{
                  ...s.card,
                  marginBottom: 0,
                  padding: "20px 24px",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: 28, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
                  {value}
                </p>
                <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        {projects.length > 0 && (
          <div style={{ ...s.card, padding: "14px 18px" }}>
            <input
              style={s.input}
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={(e) => {
                e.target.style.borderColor = "#6366f1";
                e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(71, 85, 105, 0.5)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
        )}

        {/* Project list */}
        {projects.length > 0 && (
          <>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "28px 0 14px" }}>
              {filteredProjects.length === projects.length
                ? `Active projects (${projects.length})`
                : `Showing ${filteredProjects.length} of ${projects.length} projects`}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 16,
              }}
            >
              {filteredProjects.map((p) => {
                const progress = pct(p);
                return (
                  <div
                    key={p.id}
                    onClick={() => openProject(p)}
                    style={{
                      ...s.card,
                      marginBottom: 0,
                      cursor: "pointer",
                      transition: "border-color 0.2s, transform 0.15s, box-shadow 0.2s",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = "#6366f1";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.35)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = "rgba(71, 85, 105, 0.4)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3)";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 10,
                      }}
                    >
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 16, margin: 0 }}>{p.name}</p>
                        {p.description && (
                          <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 4, lineHeight: 1.4 }}>
                            {p.description}
                          </p>
                        )}
                      </div>
                      <span
                        style={{
                          background:
                            progress === 100
                              ? "linear-gradient(135deg, #065f46 0%, #047857 100%)"
                              : "linear-gradient(135deg, #1e3a5f 0%, #312e81 100%)",
                          color: progress === 100 ? "#6ee7b7" : "#a5b4fc",
                          borderRadius: 20,
                          padding: "4px 12px",
                          fontSize: 12,
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          marginLeft: 10,
                        }}
                      >
                        {progress}%
                      </span>
                    </div>
                    <div style={{ ...s.progressTrack, margin: "12px 0" }}>
                      <div
                        style={{
                          width: `${progress}%`,
                          height: "100%",
                          background:
                            progress === 100
                              ? "linear-gradient(90deg, #10b981 0%, #34d399 100%)"
                              : "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)",
                          borderRadius: 4,
                        }}
                      />
                    </div>
                    <div
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    >
                      <div style={{ display: "flex", gap: 10 }}>
                        <span
                          style={{
                            fontSize: 12,
                            color: "#94a3b8",
                            background: "rgba(15, 23, 42, 0.8)",
                            padding: "4px 10px",
                            borderRadius: 20,
                          }}
                        >
                          {p.features.length} features
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            color: "#94a3b8",
                            background: "rgba(15, 23, 42, 0.8)",
                            padding: "4px 10px",
                            borderRadius: 20,
                          }}
                        >
                          {p.tasks.length} tasks
                        </span>
                      </div>
                      <button
                        style={s.btnDanger}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProject(p.id);
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "rgba(185, 28, 28, 0.8)")}
                        onMouseOut={(e) => (e.currentTarget.style.background = "rgba(127, 29, 29, 0.7)")}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {filteredProjects.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
                <p style={{ fontSize: 14 }}>No projects match "{search}".</p>
              </div>
            )}
          </>
        )}

        {projects.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
            <p style={{ fontSize: 15 }}>No projects yet. Create one above to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
