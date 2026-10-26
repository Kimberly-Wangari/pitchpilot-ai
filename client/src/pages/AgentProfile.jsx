
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Compass,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Pencil,
  Save,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./AgentDashboard.css";
import "./AgentProfile.css";

function AgentProfile() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileNames, setProfileNames] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
  });
  const [editing, setEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState(user?.firstName || "");
  const [editLastName, setEditLastName] = useState(user?.lastName || "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    setProfileNames({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    });
  }, [user?.firstName, user?.lastName]);

  const firstName = profileNames.firstName;
  const lastName = profileNames.lastName;
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") ||
    "Sales Agent";

  const initials =
    [firstName, lastName]
      .filter(Boolean)
      .map((name) => name.charAt(0).toUpperCase())
      .join("") || "SA";

  const handleLogout = async () => {
    setLogoutError("");
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      setLogoutError("Unable to sign out. Please try again.");
    }
  };

  const startEditing = () => {
    setEditFirstName(firstName);
    setEditLastName(lastName);
    setSaveError("");
    setSaveSuccess("");
    setEditing(true);
  };

  const cancelEditing = () => {
    if (saving) return;
    setEditing(false);
    setSaveError("");
    setEditFirstName(firstName);
    setEditLastName(lastName);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    if (saving) return;

    const nextFirstName = editFirstName.trim();
    const nextLastName = editLastName.trim();

    if (!nextFirstName || !nextLastName) {
      setSaveError("Please enter both your first and last name.");
      return;
    }
    if (nextFirstName.length > 100 || nextLastName.length > 100) {
      setSaveError("Each name must be 100 characters or fewer.");
      return;
    }

    setSaving(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      
     const response = await updateProfile({
  firstName: nextFirstName,
  lastName: nextLastName,
});

      const saved = response.data?.user || {};
      setProfileNames({
        firstName: saved.firstName || nextFirstName,
        lastName: saved.lastName || nextLastName,
      });
      setEditing(false);
      setSaveSuccess("Your name has been updated successfully.");
    } catch (error) {
      setSaveError(
        error.response?.data?.message ||
          "Unable to save your changes. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pd-dashboard pd-agent-profile">
      {sidebarOpen && (
        <button
          type="button"
          className="pd-mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`pd-sidebar ${
          sidebarOpen ? "pd-sidebar-open" : ""
        }`}
      >
        <div className="pd-sidebar-top">
          <Link to="/dashboard" className="pd-brand">
            <span className="pd-brand-symbol">
              <Sparkles size={23} strokeWidth={2.5} />
            </span>

            <span className="pd-brand-text">
              PitchPilot<span>AI</span>
              <small>TRAINING PLATFORM</small>
            </span>
          </Link>

          <button
            type="button"
            className="pd-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="pd-sidebar-section">
          <span className="pd-sidebar-label">WORKSPACE</span>

          <nav
            className="pd-sidebar-nav"
            aria-label="Profile navigation"
          >
            <Link
              to="/dashboard"
              className="pd-nav-link"
            >
              <LayoutDashboard size={19} />
              <span>Overview</span>
            </Link>

            <Link
              to="/scenarios"
              className="pd-nav-link"
            >
              <Compass size={19} />
              <span>Training Scenarios</span>
            </Link>

            <Link
              to="/profile"
              className="pd-nav-link pd-nav-active"
              aria-current="page"
            >
              <UserRound size={19} />
              <span>My Profile</span>
              <span className="pd-nav-active-indicator" />
            </Link>
          </nav>
        </div>

        <div className="pd-sidebar-section">
          <span className="pd-sidebar-label">
            YOUR DEVELOPMENT
          </span>

          <div className="pd-sidebar-info">
            <div className="pd-sidebar-info-icon">
              <GraduationCap size={20} />
            </div>

            <strong>Keep learning</strong>
            <p>
              Every practice conversation is another
              opportunity to improve.
            </p>

            <Link to="/scenarios">
              Explore training
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <div className="pd-sidebar-bottom">
          <Link
            to="/profile"
            className="pd-sidebar-profile"
            aria-label="View my profile"
          >
            <div className="pd-profile-avatar">
              {initials}
            </div>

            <div className="pd-profile-details">
              <strong>{fullName}</strong>
              <span>Sales Agent</span>
            </div>
          </Link>

          <button
            type="button"
            className="pd-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="pd-main-area">
        <header className="pd-topbar">
          <div className="pd-topbar-left">
            <button
              type="button"
              className="pd-menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>

            <div className="pd-breadcrumb">
              <span>Workspace</span>
              <ChevronRight size={15} />
              <strong>My Profile</strong>
            </div>
          </div>

          <div className="pd-topbar-right">
            <span className="pd-topbar-status">
              <span />
              My account
            </span>

            <div
              className="pd-topbar-avatar"
              title={fullName}
            >
              {initials}
            </div>
          </div>
        </header>

        <main className="pd-content">
          <div className="pd-page-heading">
            <div>
              <span className="pd-eyebrow">
                <Sparkles size={15} />
                YOUR PERSONAL SPACE
              </span>

              <h1>
                My <span>Profile.</span>
              </h1>

              <p>
                View your account details and manage
                your personal training space.
              </p>
            </div>
            <button
              type="button"
              className="pap-heading-signout"
              onClick={handleLogout}
            >
              <LogOut size={17} />
              Sign out
            </button>
          </div>
          {logoutError && (
            <p className="pap-feedback-error" role="alert">{logoutError}</p>
          )}

          {/* PROFILE HERO */}
          <section className="pap-hero">
            <div className="pap-hero-avatar">
              {initials}
            </div>

            <div className="pap-hero-info">
              <span className="pap-kicker">
                SALES AGENT ACCOUNT
              </span>

              <h2>{fullName}</h2>
              <p>{user?.email || "No email available"}</p>

              <span className="pap-role">
                <ShieldCheck size={15} />
                Sales Agent
              </span>
            </div>
          </section>

          {/* PERSONAL DETAILS */}
          <section className="pap-section">
            <div className="pd-section-heading">
              <div>
                <span className="pd-section-kicker">
                  ACCOUNT DETAILS
                </span>
                <h2>Personal information</h2>
                <p>
                  Information associated with your
                  PitchPilot AI account.
                </p>
              </div>
              {!editing && (
                <button
                  type="button"
                  className="pap-edit-button"
                  onClick={startEditing}
                >
                  <Pencil size={16} />
                  Edit name
                </button>
              )}
            </div>

            {saveSuccess && (
              <p className="pap-feedback-success" role="status">{saveSuccess}</p>
            )}
            {saveError && (
              <p className="pap-feedback-error" role="alert">{saveError}</p>
            )}

            {editing ? (
              <form className="pap-edit-form" onSubmit={saveProfile}>
                <div className="pap-edit-fields">
                  <label className="pap-edit-field" htmlFor="pap-first-name">
                    First name
                    <input
                      id="pap-first-name"
                      type="text"
                      value={editFirstName}
                      onChange={(event) => setEditFirstName(event.target.value)}
                      autoComplete="given-name"
                      maxLength={100}
                      required
                      disabled={saving}
                    />
                  </label>
                  <label className="pap-edit-field" htmlFor="pap-last-name">
                    Last name
                    <input
                      id="pap-last-name"
                      type="text"
                      value={editLastName}
                      onChange={(event) => setEditLastName(event.target.value)}
                      autoComplete="family-name"
                      maxLength={100}
                      required
                      disabled={saving}
                    />
                  </label>
                </div>
                <div className="pap-edit-actions">
                  <button
                    type="button"
                    className="pap-edit-cancel"
                    onClick={cancelEditing}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="pap-edit-save"
                    disabled={saving}
                  >
                    <Save size={16} />
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            ) : (
            <div className="pap-details-card">
              <div className="pap-detail">
                <UserRound size={19} />
                <div>
                  <span>First name</span>
                  <strong>{firstName || "Not provided"}</strong>
                </div>
              </div>

              <div className="pap-detail">
                <UserRound size={19} />
                <div>
                  <span>Last name</span>
                  <strong>{lastName || "Not provided"}</strong>
                </div>
              </div>

              <div className="pap-detail">
                <Mail size={19} />
                <div>
                  <span>Email address</span>
                  <strong>
                    {user?.email || "Not provided"}
                  </strong>
                </div>
              </div>

              <div className="pap-detail">
                <ShieldCheck size={19} />
                <div>
                  <span>Account role</span>
                  <strong>Sales Agent</strong>
                </div>
              </div>
            </div>
            )}
          </section>

          {/* TRAINING */}
          <section className="pap-section">
            <div className="pd-section-heading">
              <div>
                <span className="pd-section-kicker">
                  YOUR DEVELOPMENT
                </span>
                <h2>Training progress</h2>
                <p>
                  Your progress will appear here once
                  training history is connected.
                </p>
              </div>
            </div>

            <div className="pap-training-grid">
              <article className="pap-training-card">
                <div className="pap-training-icon">
                  <BookOpen size={23} />
                </div>
                <span>Completed sessions</span>
                <strong>—</strong>
                <p>
                  Session tracking is not connected yet.
                </p>
              </article>

              <article className="pap-training-card">
                <div className="pap-training-icon">
                  <Target size={23} />
                </div>
                <span>Skills practiced</span>
                <strong>—</strong>
                <p>
                  Your practiced skills will appear here.
                </p>
              </article>
            </div>
          </section>

          <section className="pap-next-step">
            <div>
              <span className="pd-section-kicker">
                KEEP IMPROVING
              </span>
              <h3>Ready for your next conversation?</h3>
              <p>
                Explore a training scenario and continue
                building your sales skills.
              </p>
            </div>

            <Link to="/scenarios" className="pap-cta">
              Explore scenarios
              <ArrowRight size={17} />
            </Link>
          </section>

          <footer className="pd-footer">
            <span>
              © {new Date().getFullYear()} PitchPilot AI
            </span>
            <span>Practice. Improve. Succeed.</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default AgentProfile;
