
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  Activity,
  Pencil,
  Save,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

import "./ManagerDashboard.css";
import "./ManagerProfile.css";

export default function ManagerProfile() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  // TEAM OVERVIEW
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // PROFILE EDITING
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";

  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") ||
    "Sales Manager";

  const initials =
    [firstName, lastName]
      .filter(Boolean)
      .map((name) => name.charAt(0).toUpperCase())
      .join("") || "SM";

  // LOAD MANAGER TEAM STATISTICS
  useEffect(() => {
    let active = true;

    async function loadOverview() {
      try {
        const response = await api.get("/manager/overview");

        if (active) {
          setOverview(response.data.overview);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load team statistics."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadOverview();

    return () => {
      active = false;
    };
  }, []);

  // START EDITING
  const handleEdit = () => {
    setEditFirstName(firstName);
    setEditLastName(lastName);
    setProfileError("");
    setProfileSuccess("");
    setIsEditing(true);
  };

  // CANCEL EDITING
  const handleCancel = () => {
    if (saving) return;

    setEditFirstName(firstName);
    setEditLastName(lastName);
    setProfileError("");
    setIsEditing(false);
  };

  // SAVE UPDATED PROFILE
  const handleSaveProfile = async (event) => {
    event.preventDefault();

    if (saving) return;

    const nextFirstName = editFirstName.trim();
    const nextLastName = editLastName.trim();

    setProfileError("");
    setProfileSuccess("");

    if (!nextFirstName || !nextLastName) {
      setProfileError(
        "Please enter both your first and last names."
      );
      return;
    }

    if (
      nextFirstName.length > 100 ||
      nextLastName.length > 100
    ) {
      setProfileError(
        "Names must not exceed 100 characters."
      );
      return;
    }

    if (
      nextFirstName === firstName &&
      nextLastName === lastName
    ) {
      setIsEditing(false);
      return;
    }

    try {
      setSaving(true);

      const response = await updateProfile({
        firstName: nextFirstName,
        lastName: nextLastName,
      });

      setProfileSuccess(
        response.message || "Profile updated successfully."
      );

      setIsEditing(false);
    } catch (err) {
      setProfileError(
        err.response?.data?.message ||
          err.message ||
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // SIGN OUT
  const handleLogout = async () => {
    await logout();
    navigate("/manager/login", { replace: true });
  };

  return (
    <div className="pm-page mp-page">
      {/* HEADER */}
      <header className="pm-topbar">
        <div className="pm-heading">
          <div className="pm-breadcrumb">
            Manager Workspace <span>/</span> My Profile
          </div>

          <h1>My Profile</h1>
        </div>

        <div className="pm-header-actions">
          <Link
            to="/manager/dashboard"
            className="mp-header-link"
          >
            <ArrowLeft size={17} />
            Dashboard
          </Link>

          <div className="pm-profile" title={fullName}>
            {initials}
          </div>
        </div>
      </header>

      <main className="pm-main mp-main">
        {/* PROFILE BANNER */}
        <section className="mp-hero">
          <div className="mp-hero-pattern" />

          <div className="mp-avatar">
            {initials}
          </div>

          <div className="mp-hero-info">
            <span className="mp-eyebrow">
              <Sparkles size={14} />
              MANAGER WORKSPACE
            </span>

            <h2>{fullName}</h2>

            <p>
              {user?.email || "No email available"}
            </p>

            <span className="mp-role-badge">
              <ShieldCheck size={15} />
              Sales Manager
            </span>
          </div>
        </section>

        {/* TEAM OVERVIEW */}
        <section className="mp-section">
          <div className="mp-section-heading">
            <div>
              <span className="mp-section-label">
                TEAM OVERVIEW
              </span>

              <h2>Your team at a glance</h2>

              <p>
                A quick overview of your assigned agents
                and their training activity.
              </p>
            </div>
          </div>

          {error && (
            <p className="mp-error" role="alert">
              {error}
            </p>
          )}

          <div className="mp-stat-grid">
            <article className="mp-stat-card">
              <div className="mp-stat-icon">
                <Users size={22} />
              </div>

              <span>Assigned agents</span>

              <strong>
                {loading
                  ? "..."
                  : overview?.totalAgents ?? "—"}
              </strong>

              <p>Agents assigned to your team</p>
            </article>

            <article className="mp-stat-card">
              <div className="mp-stat-icon">
                <CheckCircle2 size={22} />
              </div>

              <span>Completed simulations</span>

              <strong>
                {loading
                  ? "..."
                  : overview?.simulationsCompleted ?? "—"}
              </strong>

              <p>Completed training sessions</p>
            </article>

            <article className="mp-stat-card">
              <div className="mp-stat-icon">
                <Activity size={22} />
              </div>

              <span>Active simulations</span>

              <strong>
                {loading
                  ? "..."
                  : overview?.activeSimulations ?? "—"}
              </strong>

              <p>Currently in-progress sessions</p>
            </article>
          </div>
        </section>

        {/* ACCOUNT DETAILS */}
        <section className="mp-section">
          <div className="mp-section-heading mp-edit-heading">
            <div>
              <span className="mp-section-label">
                ACCOUNT INFORMATION
              </span>

              <h2>Personal details</h2>

              <p>
                Information associated with your
                PitchPilot AI manager account.
              </p>
            </div>

            {!isEditing && (
              <button
                type="button"
                className="mp-edit-button"
                onClick={handleEdit}
              >
                <Pencil size={16} />
                Edit Name
              </button>
            )}
          </div>

          {profileSuccess && (
            <div
              className="mp-profile-success"
              role="status"
            >
              <CheckCircle2 size={18} />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div
              className="mp-profile-error"
              role="alert"
            >
              <span>{profileError}</span>
            </div>
          )}

          <form
            className="mp-details-card mp-profile-form"
            onSubmit={handleSaveProfile}
          >
            {/* FIRST NAME */}
            <div className="mp-detail-item">
              <UserRound size={19} />

              <div className="mp-detail-content">
                {isEditing ? (
                  <>
                    <label htmlFor="mp-first-name">
                      First name
                    </label>

                    <input
                      id="mp-first-name"
                      type="text"
                      value={editFirstName}
                      onChange={(event) =>
                        setEditFirstName(
                          event.target.value
                        )
                      }
                      maxLength={100}
                      autoComplete="given-name"
                      required
                      disabled={saving}
                    />
                  </>
                ) : (
                  <>
                    <span>First name</span>
                    <strong>
                      {firstName || "Not provided"}
                    </strong>
                  </>
                )}
              </div>
            </div>

            {/* LAST NAME */}
            <div className="mp-detail-item">
              <UserRound size={19} />

              <div className="mp-detail-content">
                {isEditing ? (
                  <>
                    <label htmlFor="mp-last-name">
                      Last name
                    </label>

                    <input
                      id="mp-last-name"
                      type="text"
                      value={editLastName}
                      onChange={(event) =>
                        setEditLastName(
                          event.target.value
                        )
                      }
                      maxLength={100}
                      autoComplete="family-name"
                      required
                      disabled={saving}
                    />
                  </>
                ) : (
                  <>
                    <span>Last name</span>
                    <strong>
                      {lastName || "Not provided"}
                    </strong>
                  </>
                )}
              </div>
            </div>

            {/* EMAIL */}
            <div className="mp-detail-item">
              <Mail size={19} />

              <div className="mp-detail-content">
                <span>Email address</span>

                <strong>
                  {user?.email || "Not provided"}
                </strong>
              </div>
            </div>

            {/* ROLE */}
            <div className="mp-detail-item">
              <ShieldCheck size={19} />

              <div className="mp-detail-content">
                <span>Account role</span>
                <strong>Sales Manager</strong>
              </div>
            </div>

            {/* EDITING ACTIONS */}
            {isEditing && (
              <div className="mp-edit-actions">
                <button
                  type="button"
                  className="mp-cancel-button"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X size={16} />
                  Cancel
                </button>

                <button
                  type="submit"
                  className="mp-save-button"
                  disabled={saving}
                >
                  <Save size={16} />

                  {saving
                    ? "Saving Changes..."
                    : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </section>

        {/* MANAGER ACCOUNT */}
        <section className="mp-section">
          <div className="mp-section-heading">
            <div>
              <span className="mp-section-label">
                ACCOUNT ACCESS
              </span>

              <h2>Manager access</h2>
            </div>
          </div>

          <div className="mp-access-card">
            <div className="mp-access-icon">
              <ShieldCheck size={23} />
            </div>

            <div className="mp-access-content">
              <h3>Manager workspace</h3>

              <p>
                Your manager account provides access to
                assigned agents, training activity,
                performance reports and team analytics.
              </p>

              <span>
                <Clock3 size={15} />
                Account access is controlled by your
                authenticated manager role.
              </span>
            </div>

            <Link
              to="/manager/dashboard"
              className="mp-access-link"
            >
              View dashboard
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        {/* FOOTER ACTIONS */}
        <div className="mp-footer-actions">
          <Link
            to="/manager/dashboard"
            className="mp-back-button"
          >
            <ArrowLeft size={17} />
            Back to dashboard
          </Link>

          <button
            type="button"
            className="mp-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>

        <footer className="mp-footer">
          © {new Date().getFullYear()} PitchPilot AI
          <span>Practice. Improve. Succeed.</span>
        </footer>
      </main>
    </div>
  );
}
