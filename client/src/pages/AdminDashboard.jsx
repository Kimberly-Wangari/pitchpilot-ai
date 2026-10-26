
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldAlert,
  UserRound,
  Users,
  UserX,
  UserPlus,
  ArrowUpCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

import "./AdminDashboard.css";

const initialOverview = {
  totalUsers: 0,
  totalAgents: 0,
  totalManagers: 0,
  totalAdmins: 0,
  activeUsers: 0,
  suspendedUsers: 0,
  unverifiedUsers: 0,
};


function AdminUserManagement({ onChanged }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [promoteUser, setPromoteUser] = useState(null);
  const [promoting, setPromoting] = useState(false);
const [updatingStatus, setUpdatingStatus] = useState(false);
const [successMessage, setSuccessMessage] = useState("");
const [refreshKey, setRefreshKey] = useState(0);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadUsers = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/admin/users", {
          params: {
            search,
            role,
            status,
            page,
            limit: 10,
          },
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setUsers(response.data.users);
          setPagination(response.data.pagination);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err.response?.data?.message ||
              "Unable to load registered users."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadUsers();

    return () => controller.abort();
  }, [search, role, status, page,refreshKey]);

  
const handleUpdateStatus = async () => {
  if (!selectedUser || updatingStatus) return;

  const newStatus = !selectedUser.isActive;

  setUpdatingStatus(true);
  setError("");
  setSuccessMessage("");

  try {
    const response = await api.patch(
      `/admin/users/${selectedUser.id}/status`,
      {
        isActive: newStatus,
      }
    );

    setSuccessMessage(response.data.message);

    // Refresh registered users.
    setRefreshKey((current) => current + 1);
    onChanged?.();

    // Close confirmation dialog.
    setSelectedUser(null);
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Unable to update account status."
    );
    setSelectedUser(null);
  } finally {
    setUpdatingStatus(false);
  }
};


  const handlePromote = async () => {
    if (!promoteUser || promoting) return;
    setPromoting(true);
    setError("");
    setSuccessMessage("");
    try {
      const response = await api.patch(`/admin/users/${promoteUser.id}/promote`);
      setSuccessMessage(response.data.message);
      setPromoteUser(null);
      setRefreshKey((current) => current + 1);
      onChanged?.();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to promote this agent.");
      setPromoteUser(null);
    } finally {
      setPromoting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <section className="pa-users-panel">
      {successMessage && (
  <div
    className="pa-success-message"
    role="status"
  >
    <CheckCircle2 size={17} />
    {successMessage}
  </div>
)}
      <div className="pa-users-toolbar">
        <div className="pa-users-search">
          <Search size={17} />

          <input
            type="search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            aria-label="Search registered users"
          />
        </div>

        <div className="pa-users-filters">
          <select
            value={role}
            onChange={(event) => {
              setRole(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by role"
          >
            <option value="all">All roles</option>
            <option value="agent">Agents</option>
            <option value="manager">Managers</option>
            <option value="admin">Administrators</option>
          </select>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by account status"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="pa-error" role="alert">
          <ShieldAlert size={17} />
          {error}
        </div>
      )}

      <div className="pa-users-table-scroll">
        <table className="pa-users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Account status</th>
              <th>Email verification</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="pa-users-empty">
                  Loading registered users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="pa-users-empty">
                  No users match your filters.
                </td>
              </tr>
            ) : (
              users.map((account) => {
                const name =
                  [
                    account.firstName,
                    account.lastName,
                  ]
                    .filter(Boolean)
                    .join(" ") || "Unnamed user";

                const initials =
                  [
                    account.firstName,
                    account.lastName,
                  ]
                    .filter(Boolean)
                    .map((part) =>
                      part.charAt(0).toUpperCase()
                    )
                    .join("") || "U";

                return (
                  <tr key={account.id}>
                    <td>
                      <div className="pa-user-identity">
                        <div className="pa-user-avatar">
                          {initials}
                        </div>

                        <div>
                          <strong>{name}</strong>
                          <small>{account.email}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`pa-role-badge pa-role-${account.role}`}
                      >
                        {account.role}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          account.isActive
                            ? "pa-status-badge pa-active"
                            : "pa-status-badge pa-suspended"
                        }
                      >
                        {account.isActive
                          ? "Active"
                          : "Suspended"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          account.emailVerified
                            ? "pa-verification pa-verified"
                            : "pa-verification pa-unverified"
                        }
                      >
                        {account.emailVerified
                          ? "Verified"
                          : "Not verified"}
                      </span>
                    </td>

                    <td>{formatDate(account.createdAt)}</td>
                    
<td>
  {account.role === "admin" ? (
    <span className="pa-protected-label">
      <LockKeyhole size={13} />
      Protected
    </span>
  ) : (
    <div className="pa-user-actions">
        {!account.isActive && !account.emailVerified && account.role === "manager" ? (
        <span className="pa-protected-label">Awaiting activation</span>
      ) : (
    <button
      type="button"
      className={
        account.isActive
          ? "pa-user-action pa-suspend-button"
          : "pa-user-action pa-reactivate-button"
      }
      onClick={() => {
        setSuccessMessage("");
        setSelectedUser(account);
      }}
    >
      {account.isActive ? (
        <>
          <UserX size={14} />
          Suspend
        </>
      ) : (
        <>
          <CheckCircle2 size={14} />
          Reactivate
        </>
      )}
    </button>
      )}
      {account.role === "agent" && account.isActive && account.emailVerified && (
        <button
          type="button"
          className="pa-user-action pa-promote-button"
          onClick={() => { setSuccessMessage(""); setPromoteUser(account); }}
        >
          <ArrowUpCircle size={14} /> Promote
        </button>
      )}
    
    </div>
  )}
</td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="pa-users-footer">
        <span>
          {loading
            ? "Loading..."
            : `${pagination.total} registered user(s) found`}
        </span>

        <div className="pa-pagination">
          <button
            type="button"
            disabled={loading || page <= 1}
            onClick={() =>
              setPage((current) => current - 1)
            }
          >
            Previous
          </button>

          <span>
            Page {page} of {Math.max(pagination.totalPages, 1)}
          </span>

          <button
            type="button"
            disabled={
              loading ||
              page >= pagination.totalPages
            }
            onClick={() =>
              setPage((current) => current + 1)
            }
          >
            Next
          </button>
        </div>
      </div>

      {/* CONFIRM ACCOUNT STATUS CHANGE */}
      {selectedUser && (
        <div
          className="pa-confirm-backdrop"
          onClick={() => {
            if (!updatingStatus) {
              setSelectedUser(null);
            }
          }}
        >
          <div
            className="pa-confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="pa-confirm-title"
            aria-describedby="pa-confirm-description"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pa-confirm-icon">
              {selectedUser.isActive ? (
                <UserX size={25} />
              ) : (
                <CheckCircle2 size={25} />
              )}
            </div>
      
            <h3 id="pa-confirm-title">
              {selectedUser.isActive
                ? "Suspend this account?"
                : "Reactivate this account?"}
            </h3>
      
            <p id="pa-confirm-description">
              {selectedUser.isActive
                ? "You are about to suspend"
                : "You are about to reactivate"}{" "}
              <strong>
                {selectedUser.firstName}{" "}
                {selectedUser.lastName}
              </strong>{" "}
              ({selectedUser.email}).
            </p>
      
            <p className="pa-confirm-note">
              {selectedUser.isActive
                ? "Suspension will block access to protected endpoints and prevent future sign-ins."
                : "Reactivation will allow this account to sign in again, subject to normal authentication requirements."}
            </p>
      
            <div className="pa-confirm-actions">
              <button
                type="button"
                className="pa-confirm-cancel"
                disabled={updatingStatus}
                onClick={() => setSelectedUser(null)}
              >
                Cancel
              </button>
      
              <button
                type="button"
                className={
                  selectedUser.isActive
                    ? "pa-confirm-danger"
                    : "pa-confirm-approve"
                }
                disabled={updatingStatus}
                onClick={handleUpdateStatus}
              >
                {updatingStatus
                  ? "Updating..."
                  : selectedUser.isActive
                    ? "Yes, suspend"
                    : "Yes, reactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function AdminManagerManagement({ onChanged }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleCreate = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/admin/managers", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      });

      setSuccess(response.data.message || "Invitation sent successfully.");
      setFirstName("");
      setLastName("");
      setEmail("");
      onChanged?.();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to create manager account."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="pa-manager-management" className="pa-manager-management">
      <form className="pa-manager-create-form" onSubmit={handleCreate}>
        <div className="pa-manager-management-heading pa-manager-form-full">
          <UserPlus size={21} />
          <div>
            <h3>Invite a Sales Manager</h3>
            <p>Create an account and email a 24-hour activation invitation.</p>
          </div>
        </div>

        <div className="pa-manager-form-field">
          <label htmlFor="pa-manager-first-name">First name</label>
          <input
            id="pa-manager-first-name"
            type="text"
            maxLength={100}
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            autoComplete="given-name"
            required
            disabled={submitting}
          />
        </div>

        <div className="pa-manager-form-field">
          <label htmlFor="pa-manager-last-name">Last name</label>
          <input
            id="pa-manager-last-name"
            type="text"
            maxLength={100}
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            autoComplete="family-name"
            required
            disabled={submitting}
          />
        </div>

        <div className="pa-manager-form-field pa-manager-form-full">
          <label htmlFor="pa-manager-email">Email address</label>
          <input
            id="pa-manager-email"
            type="email"
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            disabled={submitting}
          />
        </div>

        <div className="pa-manager-form-actions">
          <button
            className="pa-manager-submit-button"
            type="submit"
            disabled={submitting}
          >
            <UserPlus size={16} />
            {submitting ? "Sending invitation..." : "Create and invite manager"}
          </button>
        </div>

        <p className="pa-manager-create-note pa-manager-form-full">
          To promote an existing agent instead, use the Promote action in Registered users above.
        </p>
      </form>

      {success && (
        <div className="pa-success-message" role="status">
          <CheckCircle2 size={17} />
          {success}
        </div>
      )}
      {error && (
        <div className="pa-error" role="alert">
          <ShieldAlert size={17} />
          {error}
        </div>
      )}
    </section>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [overview, setOverview] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [overviewResponse, profileResponse] =
        await Promise.all([
          api.get("/admin/overview"),
          api.get("/admin/me"),
        ]);

      setOverview(overviewResponse.data.overview);
      setAdminProfile(profileResponse.data.user);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load administrator information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = overview || initialOverview;
  const currentAdmin = adminProfile || user;

  const fullName =
    [
      currentAdmin?.firstName,
      currentAdmin?.lastName,
    ]
      .filter(Boolean)
      .join(" ") || "Administrator";

  const initials =
    [
      currentAdmin?.firstName,
      currentAdmin?.lastName,
    ]
      .filter(Boolean)
      .map((name) => name.charAt(0).toUpperCase())
      .join("") || "AD";

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const statCards = [
    {
      label: "REGISTERED USERS",
      value: stats.totalUsers,
      description: "All accounts on PitchPilot AI",
      icon: Users,
    },
    {
      label: "SALES AGENTS",
      value: stats.totalAgents,
      description: "Registered training participants",
      icon: UserRound,
    },
    {
      label: "SALES MANAGERS",
      value: stats.totalManagers,
      description: "Accounts with the manager role",
      icon: ShieldCheck,
    },
    {
      label: "ACTIVE ACCOUNTS",
      value: stats.activeUsers,
      description: "Accounts currently enabled",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="pa-page">
      {/* HEADER */}
      <header className="pa-topbar">
        <div className="pa-heading">
          <div className="pa-breadcrumb">
            PitchPilot AI
            <span> / </span>
            Administration
          </div>

          <h1>Admin Dashboard</h1>
        </div>

        <div className="pa-header-actions">
          <span className="pa-admin-label">
            <ShieldCheck size={14} />
            Administrator
          </span>

          <div
            className="pa-profile-avatar"
            title={fullName}
            aria-label={`Administrator: ${fullName}`}
          >
            {initials}
          </div>
        </div>
      </header>

      <main className="pa-main">
        {/* WELCOME BANNER */}
        <section className="pa-welcome">
          <div className="pa-welcome-content">
            <span className="pa-eyebrow">
              <ShieldCheck size={15} />
              PLATFORM ADMINISTRATION
            </span>

            <h2>Welcome back, {fullName}.</h2>

            <p>
              Manage PitchPilot AI accounts, review
              platform activity, and oversee access
              to the sales training system.
            </p>

            <div className="pa-welcome-tags">
              <span>
                <LockKeyhole size={14} />
                Protected workspace
              </span>

              <span>
                <Activity size={14} />
                Live platform data
              </span>
            </div>
          </div>

          <div className="pa-welcome-symbol">
            <ShieldCheck size={100} strokeWidth={1.1} />
          </div>
        </section>

        {/* SECTION HEADER */}
        <div className="pa-section-heading">
          <div>
            <span className="pa-section-eyebrow">
              PLATFORM OVERVIEW
            </span>

            <h2>System statistics</h2>

            <p>
              An overview of registered accounts
              and platform access.
            </p>
          </div>

          <button
            type="button"
            className="pa-refresh-button"
            onClick={loadDashboard}
            disabled={loading}
          >
            <RefreshCw size={15} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="pa-error" role="alert">
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* STATISTICS */}
        <section className="pa-stat-grid">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                className="pa-stat-card"
                key={card.label}
              >
                <div className="pa-stat-top">
                  <span>{card.label}</span>

                  <div className="pa-stat-icon">
                    <Icon size={19} />
                  </div>
                </div>

                <strong>
                  {loading || !overview
                    ? "—"
                    : card.value}
                </strong>

                <p>{card.description}</p>
              </article>
            );
          })}
        </section>

        {/* ACCOUNT STATUS */}
        <div className="pa-section-heading">
          <div>
            <span className="pa-section-eyebrow">
              ACCOUNT MONITORING
            </span>

            <h2>Account status</h2>

            <p>
              Monitor verification and account
              availability across the platform.
            </p>
          </div>
        </div>

        <section className="pa-status-grid">
          <article className="pa-status-card">
            <div className="pa-status-icon pa-purple">
              <ShieldCheck size={21} />
            </div>

            <div>
              <span>Administrator accounts</span>
              <strong>
                {loading || !overview
                  ? "—"
                  : stats.totalAdmins}
              </strong>
              <p>Accounts assigned the admin role</p>
            </div>
          </article>

          <article className="pa-status-card">
            <div className="pa-status-icon pa-peach">
              <Clock3 size={21} />
            </div>

            <div>
              <span>Unverified accounts</span>
              <strong>
                {loading || !overview
                  ? "—"
                  : stats.unverifiedUsers}
              </strong>
              <p>Awaiting email verification</p>
            </div>
          </article>

          <article className="pa-status-card">
            <div className="pa-status-icon pa-red">
              <UserX size={21} />
            </div>

            <div>
              <span>Suspended accounts</span>
              <strong>
                {loading || !overview
                  ? "—"
                  : stats.suspendedUsers}
              </strong>
              <p>Accounts currently inactive</p>
            </div>
          </article>
        </section>
        
{/* USER MANAGEMENT */}
<div className="pa-section-heading">
  <div>
    <span className="pa-section-eyebrow">
      USER MANAGEMENT
    </span>

    <h2>Registered users</h2>

    <p>
      View, search, and filter accounts registered
      on PitchPilot AI.
    </p>
  </div>
</div>



<AdminUserManagement onChanged={loadDashboard} />


{/* MANAGER MANAGEMENT */}
        <div className="pa-section-heading">
          <div>
            <span className="pa-section-eyebrow">MANAGER MANAGEMENT</span>
            <h2>Sales Manager accounts</h2>
            <p>Invite new managers, promote eligible agents, and control manager access.</p>
          </div>
        </div>
        <AdminManagerManagement onChanged={loadDashboard} />

{/* MANAGEMENT WORKSPACE */}
        <div className="pa-section-heading">
          <div>
            <span className="pa-section-eyebrow">
              ADMINISTRATION TOOLS
            </span>

            <h2>Management workspace</h2>

            <p>
              Administrative features for managing
              users and monitoring the platform.
            </p>
          </div>
        </div>

        <section className="pa-tools-grid">
          <article className="pa-tool-card">
            <div className="pa-tool-icon">
              <Users size={23} />
            </div>

            <h3>User management</h3>

            <p>
              View registered sales agents and
              managers, inspect account roles,
              and manage account access.
            </p>

            <span className="pa-tool-status">
              Next implementation
              <ArrowRight size={15} />
            </span>
          </article>

          <article className="pa-tool-card">
            <div className="pa-tool-icon">
              <ShieldCheck size={23} />
            </div>

            <h3>Manager management</h3>

            <p>
              Review manager account requests
              and manage authorization to
              manager-only features.
            </p>

            <span className="pa-tool-status">
              Planned feature
              <ArrowRight size={15} />
            </span>
          </article>

          <article className="pa-tool-card">
            <div className="pa-tool-icon">
              <Activity size={23} />
            </div>

            <h3>Platform activity</h3>

            <p>
              Review administrative actions,
              account changes, and platform
              activity through audit logs.
            </p>

            <span className="pa-tool-status">
              Planned feature
              <ArrowRight size={15} />
            </span>
          </article>
        </section>

        {/* ADMIN ACCOUNT */}
        <section className="pa-account-panel">
          <div className="pa-account-left">
            <div className="pa-account-icon">
              <LockKeyhole size={22} />
            </div>

            <div>
              <h3>Administrator access</h3>

              <p>
                Signed in as{" "}
                <strong>
                  {currentAdmin?.email || "—"}
                </strong>
              </p>

              <span>
                Administrative actions are
                protected by backend authorization.
              </span>
            </div>
          </div>

          <button
            type="button"
            className="pa-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </section>

        <footer className="pa-footer">
          <span>
            © {new Date().getFullYear()} PitchPilot AI
          </span>

          <span>
            Administration Workspace
          </span>
        </footer>
      </main>
    </div>
  );
}

