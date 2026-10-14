
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Filter,
  Search,
  TrendingUp,
  X,
} from "lucide-react";

import api from "../services/api";
import "./ManagerDashboard.css";

function exportCsv(agents) {
  const rows = [
    ["Agent", "Email", "Completed", "In Progress"],
    ...agents.map((a) => [
      a.name,
      a.email,
      a.completed,
      a.inProgress,
    ]),
  ];

  const csv = rows
    .map((row) =>
      row
        .map((value) =>
          `"${String(value ?? "").replaceAll('"', '""')}"`
        )
        .join(",")
    )
    .join("\r\n");

  const blob = new Blob(["\ufeff", csv], {
    type: "text/csv;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "pitchpilot-agents.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function ManagerDashboard() {
  const [overview, setOverview] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const [overviewResponse, agentsResponse] =
          await Promise.all([
            api.get("/manager/overview"),
            api.get("/manager/agents"),
          ]);

        if (!active) return;

        setOverview(overviewResponse.data.overview);
        setAgents(agentsResponse.data.agents);
      } catch (err) {
        if (!active) return;

        setError(
          err.response?.data?.message ||
            "Unable to load team performance."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        agent.name.toLowerCase().includes(query) ||
        agent.email.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" ||
        (filter === "completed" && agent.completed > 0) ||
        (filter === "active" && agent.inProgress > 0) ||
        (filter === "not-started" &&
          agent.completed === 0 &&
          agent.inProgress === 0);

      return matchesSearch && matchesFilter;
    });
  }, [agents, search, filter]);

  async function openReport(agentId) {
    setReportLoading(true);
    setReportError("");
    setReport(null);

    try {
      const response = await api.get(
        `/manager/agents/${agentId}`
      );
      setReport(response.data);
    } catch (err) {
      setReportError(
        err.response?.data?.message ||
          "Unable to load the agent report."
      );
    } finally {
      setReportLoading(false);
    }
  }

  return (
    <div className="pm-page">
      <header className="pm-topbar">
        <div className="pm-heading">
          <div className="pm-breadcrumb">
            Overview <span>/</span> Performance
          </div>
          <h1>Team Performance Dashboard</h1>
        </div>

        <div className="pm-header-actions">
          <button
            type="button"
            className="pm-icon-button"
            aria-label="Notifications"
            title="Notifications coming soon"
            disabled
          >
            <Bell size={18} />
          </button>
          <span className="pm-profile">M</span>
        </div>
      </header>

      <main className="pm-main">
        {loading && <p>Loading team performance...</p>}

        {error && (
          <p role="alert" style={{ color: "#b42318" }}>
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            <div className="pm-stat-grid">
              <section className="pm-stat-card">
                <div className="pm-stat-top">
                  <span>TOTAL SIMULATIONS COMPLETED</span>
                  <span className="pm-stat-icon">
                    <CheckCircle2 size={19} />
                  </span>
                </div>
                <strong>
                  {overview.simulationsCompleted.toLocaleString()}
                </strong>
                <div className="pm-stat-caption">
                  Completed training sessions
                </div>
              </section>

              <section className="pm-stat-card">
                <div className="pm-stat-top">
                  <span>AVERAGE TEAM SCORE</span>
                  <span className="pm-stat-icon">
                    <TrendingUp size={19} />
                  </span>
                </div>
                <strong style={{ fontSize: 25 }}>
                  Not yet evaluated
                </strong>
                <div className="pm-stat-caption">
                  Available after LLM scoring is integrated
                </div>
              </section>

              <section className="pm-stat-card pm-gaps-card">
                <div className="pm-stat-top">
                  <span>TEAM TRAINING ACTIVITY</span>
                  <span className="pm-stat-icon">
                    <CircleAlert size={19} />
                  </span>
                </div>
                <div className="pm-skill-gaps">
                  <div>
                    Assigned agents
                    <span className="pm-gap-value">
                      {overview.totalAgents}
                    </span>
                  </div>
                  <div>
                    In-progress simulations
                    <span className="pm-gap-value">
                      {overview.activeSimulations}
                    </span>
                  </div>
                  <div>
                    Skill gaps
                    <span className="pm-gap-value">
                      Pending evaluation
                    </span>
                  </div>
                </div>
              </section>
            </div>

            <section className="pm-table-panel">
              <div className="pm-toolbar">
                <label className="pm-search">
                  <Search size={17} />
                  <input
                    type="search"
                    placeholder="Search agents..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                  />
                </label>

                <div className="pm-toolbar-actions">
                  <div className="pm-filter-wrap">
                    <button
                      className="pm-outline-button"
                      type="button"
                      onClick={() =>
                        setFilterOpen(!filterOpen)
                      }
                      aria-expanded={filterOpen}
                    >
                      <Filter size={16} />
                      Filters
                      <ChevronDown size={14} />
                    </button>

                    {filterOpen && (
                      <div className="pm-filter-menu">
                        {[
                          ["all", "All agents"],
                          ["completed", "Has completed sessions"],
                          ["active", "Has active sessions"],
                          ["not-started", "Not started"],
                        ].map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            className={
                              filter === value ? "selected" : ""
                            }
                            onClick={() => {
                              setFilter(value);
                              setFilterOpen(false);
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    className="pm-outline-button"
                    type="button"
                    onClick={() =>
                      exportCsv(filteredAgents)
                    }
                  >
                    <ArrowDownToLine size={16} />
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="pm-table-scroll">
                <table className="pm-table">
                  <thead>
                    <tr>
                      <th>AGENT NAME</th>
                      <th>COMPLETED SCENARIOS</th>
                      <th>RECENT PERFORMANCE SCORE</th>
                      <th className="pm-action-head">
                        ACTION
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAgents.map((agent) => (
                      <tr key={agent.id}>
                        <td>
                          <div className="pm-agent-cell">
                            <span className="pm-avatar">
                              {agent.initials}
                            </span>
                            <span>
                              <strong>{agent.name}</strong>
                              <small>{agent.email}</small>
                            </span>
                          </div>
                        </td>

                        <td className="pm-completed">
                          {agent.completed}
                        </td>

                        <td>
                          <span className="pm-score-label">
                            Not yet evaluated
                          </span>
                        </td>

                        <td className="pm-action-cell">
                          <button
                            type="button"
                            className="pm-report-button"
                            onClick={() =>
                              openReport(agent.id)
                            }
                          >
                            View Report
                            <ArrowRight size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredAgents.length === 0 && (
                  <div className="pm-empty">
                    No agents found. Check your manager
                    assignments or filters.
                  </div>
                )}
              </div>

              <div className="pm-table-footer">
                Showing {filteredAgents.length} of{" "}
                {agents.length} agents
                <span>Live PostgreSQL training data</span>
              </div>
            </section>
          </>
        )}
      </main>

      {(reportLoading || reportError || report) && (
        <div
          className="pm-modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setReport(null);
              setReportError("");
              setReportLoading(false);
            }
          }}
        >
          <section
            className="pm-report-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Agent training report"
          >
            <div className="pm-modal-header">
              <div>
                <div className="pm-breadcrumb">
                  AGENT TRAINING REPORT
                </div>
                <h2>
                  {report?.agent?.name || "Agent report"}
                </h2>
              </div>

              <button
                type="button"
                className="pm-icon-button"
                aria-label="Close report"
                onClick={() => {
                  setReport(null);
                  setReportError("");
                  setReportLoading(false);
                }}
              >
                <X size={20} />
              </button>
            </div>

            {reportLoading && <p>Loading report...</p>}

            {reportError && (
              <p role="alert">{reportError}</p>
            )}

            {report && (
              <>
                <p className="pm-report-note">
                  Performance scoring is not yet available.
                  Below is the agent's actual training history.
                </p>

                <h3>Recent training sessions</h3>

                {report.sessions.length === 0 ? (
                  <p>No training sessions recorded yet.</p>
                ) : (
                  <div className="pm-modal-skills">
                    {report.sessions.map((session) => (
                      <div
                        key={session.id}
                        style={{
                          borderBottom:
                            "1px solid #e5e8f0",
                          paddingBottom: 12,
                        }}
                      >
                        <div className="pm-skill-label">
                          <strong>
                            {session.scenario_title}
                          </strong>
                          <span>{session.status}</span>
                        </div>
                        <small>
                          Started:{" "}
                          {new Date(
                            session.started_at
                          ).toLocaleString()}
                        </small>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
