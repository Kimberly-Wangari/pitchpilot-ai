
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  BrainCircuit,
  ChevronRight,
  Clock3,
  Compass,
  Flame,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Play,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import "./AgentDashboard.css";

const trainingScenarios = [
  {
    id: 1,
    title: "Price Objection",
    category: "OBJECTION HANDLING",
    description:
      "Learn to communicate value when a customer questions the price.",
    icon: Wallet,
    accent: "violet",
    level: "Intermediate",
  },
  {
    id: 2,
    title: "Competitor Comparison",
    category: "COMPETITIVE SELLING",
    description:
      "Respond confidently when a customer compares alternatives.",
    icon: TrendingUp,
    accent: "cyan",
    level: "Intermediate",
  },
  {
    id: 3,
    title: "Discovering Customer Needs",
    category: "CUSTOMER DISCOVERY",
    description:
      "Ask thoughtful questions to understand customer priorities.",
    icon: Users,
    accent: "pink",
    level: "Beginner",
  },
  {
    id: 4,
    title: "Hesitant Decision Maker",
    category: "CUSTOMER ENGAGEMENT",
    description:
      "Practice guiding an uncertain customer through their concerns.",
    icon: MessageCircle,
    accent: "orange",
    level: "Advanced",
  },
];


const sidebarLinks = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    to: "/dashboard",
    active: true,
  },
  {
    label: "Training Scenarios",
    icon: Compass,
    to: "/scenarios",
  },
  {
    label: "My Profile",
    icon: UserRound,
    to: "/profile",
  },
];


function DashboardLogo() {
  return (
    <Link to="/dashboard" className="pd-brand">
      <span className="pd-brand-symbol">
        <Sparkles size={23} strokeWidth={2.5} />
      </span>

      <span className="pd-brand-text">
        PitchPilot<span>AI</span>
        <small>TRAINING PLATFORM</small>
      </span>
    </Link>
  );
}

function ScenarioCard({ scenario }) {
  const Icon = scenario.icon;

  return (
    <article
      className={`pd-scenario-card pd-accent-${scenario.accent}`}
    >
      <div className="pd-scenario-top">
        <span className="pd-scenario-icon">
          <Icon size={23} />
        </span>

        <span className="pd-scenario-level">
          {scenario.level}
        </span>
      </div>

      <span className="pd-scenario-category">
        {scenario.category}
      </span>

      <h3>{scenario.title}</h3>

      <p>{scenario.description}</p>

      <Link to="/scenarios" className="pd-scenario-action">
        Explore scenario
        <ArrowUpRight size={17} />
      </Link>
    </article>
  );
}

function AgentDashboard() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const firstName = user?.firstName || "Agent";

  const fullName =
    [user?.firstName, user?.lastName]
      .filter(Boolean)
      .join(" ") || "Sales Agent";

  const initials =
    [user?.firstName, user?.lastName]
      .filter(Boolean)
      .map((name) => name.charAt(0).toUpperCase())
      .join("") || "SA";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="pd-dashboard">
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
        className={`pd-sidebar ${sidebarOpen ? "pd-sidebar-open" : ""}`}
      >
        <div className="pd-sidebar-top">
          <DashboardLogo />

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

          <nav className="pd-sidebar-nav" aria-label="Dashboard navigation">
            {sidebarLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`pd-nav-link ${
                    item.active ? "pd-nav-active" : ""
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={19} />
                  <span>{item.label}</span>

                  {item.active && (
                    <span className="pd-nav-active-indicator" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pd-sidebar-section">
          <span className="pd-sidebar-label">YOUR DEVELOPMENT</span>

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

      {/* MAIN CONTENT */}
      <div className="pd-main-area">
        {/* TOP BAR */}
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
              <strong>Overview</strong>
            </div>
          </div>

          <div className="pd-topbar-right">
            <span className="pd-topbar-status">
              <span />
              Ready to train
            </span>

            
<Link
  to="/profile"
  className="pd-topbar-avatar"
  title="View my profile"
  aria-label={`View profile for ${fullName}`}
>
  {initials}
</Link>

          </div>
        </header>

        <main className="pd-content">
          {/* PAGE INTRO */}
          <div className="pd-page-heading">
            <div>
              <span className="pd-eyebrow">
                <Sparkles size={15} />
                YOUR PERSONAL TRAINING SPACE
              </span>

              <h1>
                Welcome back,{" "}
                <span>{firstName}.</span>
              </h1>

              <p>
                Every conversation is a chance to grow.
                Ready to sharpen your sales skills?
              </p>
            </div>

            <div className="pd-heading-date">
              <Clock3 size={17} />
              {new Date().toLocaleDateString("en-KE", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>

          {/* HERO */}
          <section className="pd-hero-banner">
            <div className="pd-hero-grid" />
            <div className="pd-hero-orb pd-hero-orb-one" />
            <div className="pd-hero-orb pd-hero-orb-two" />

            <div className="pd-hero-content">
              <div className="pd-hero-badge">
                <Zap size={14} />
                YOUR NEXT LEVEL STARTS HERE
              </div>

              <h2>
                Build confidence.
                <br />
                <span>Master the conversation.</span>
              </h2>

              <p>
                Practice real-world sales situations,
                develop stronger responses and become
                more prepared for customer interactions.
              </p>

              <div className="pd-hero-actions">
                <Link
                  to="/scenarios"
                  className="pd-primary-button"
                >
                  <Play size={17} fill="currentColor" />
                  Start training
                  <ArrowRight size={18} />
                </Link>

                <span className="pd-hero-hint">
                  Choose a scenario to begin
                </span>
              </div>
            </div>

            <div className="pd-hero-illustration" aria-hidden="true">
              <div className="pd-illustration-ring pd-ring-outer" />
              <div className="pd-illustration-ring pd-ring-inner" />

              <div className="pd-illustration-core">
                <BrainCircuit size={76} strokeWidth={1.3} />
              </div>

              <div className="pd-illustration-float pd-float-one">
                <MessageCircle size={18} />
              </div>

              <div className="pd-illustration-float pd-float-two">
                <Target size={18} />
              </div>

              <div className="pd-illustration-float pd-float-three">
                <TrendingUp size={18} />
              </div>
            </div>
          </section>

          {/* OVERVIEW CARDS */}
          <section className="pd-overview-section">
            <div className="pd-section-heading">
              <div>
                <span className="pd-section-kicker">
                  AT A GLANCE
                </span>

                <h2>Your training overview</h2>
              </div>
            </div>

            <div className="pd-stat-grid">
              <article className="pd-stat-card">
                <div className="pd-stat-icon pd-stat-violet">
                  <BookOpen size={22} />
                </div>

                <span className="pd-stat-label">
                  Available scenarios
                </span>

                <strong>{trainingScenarios.length}</strong>

                <p>
                  Explore your practice library
                </p>
              </article>

              <article className="pd-stat-card">
                <div className="pd-stat-icon pd-stat-cyan">
                  <BarChart3 size={22} />
                </div>

                <span className="pd-stat-label">
                  Training sessions
                </span>

                <strong>—</strong>

                <p>
                  Session tracking coming next
                </p>
              </article>

              <article className="pd-stat-card">
                <div className="pd-stat-icon pd-stat-pink">
                  <Target size={22} />
                </div>

                <span className="pd-stat-label">
                  Current focus
                </span>

                <strong className="pd-stat-text">
                  Build your skills
                </strong>

                <p>
                  Start a scenario to practice
                </p>
              </article>
            </div>
          </section>

          {/* SCENARIOS */}
          <section className="pd-training-section">
            <div className="pd-section-heading">
              <div>
                <span className="pd-section-kicker">
                  TRAIN WITH PURPOSE
                </span>

                <h2>Explore training scenarios</h2>

                <p>
                  Choose a skill to practice and prepare
                  for real customer conversations.
                </p>
              </div>

              <Link to="/scenarios" className="pd-view-all">
                View all scenarios
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="pd-scenario-grid">
              {trainingScenarios.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                />
              ))}
            </div>
          </section>

          {/* LOWER SECTION */}
          <section className="pd-bottom-grid">
            <article className="pd-activity-card">
              <div className="pd-card-heading">
                <div>
                  <span className="pd-section-kicker">
                    YOUR ACTIVITY
                  </span>

                  <h3>Recent training</h3>
                </div>

                <span className="pd-card-heading-icon">
                  <Clock3 size={19} />
                </span>
              </div>

              <div className="pd-empty-state">
                <div className="pd-empty-icon">
                  <MessageCircle size={29} />
                </div>

                <h4>Your journey starts here</h4>

                <p>
                  Your recent sessions will appear here
                  once training history is connected.
                </p>

                <Link to="/scenarios">
                  Explore scenarios
                  <ArrowRight size={16} />
                </Link>
              </div>
            </article>

            <article className="pd-tip-card">
              <div className="pd-card-heading">
                <div>
                  <span className="pd-section-kicker">
                    GROW EVERY DAY
                  </span>

                  <h3>Training tip</h3>
                </div>

                <span className="pd-tip-sparkle">
                  <Sparkles size={20} />
                </span>
              </div>

              <div className="pd-tip-illustration">
                <div className="pd-tip-circle">
                  <BrainCircuit size={42} />
                </div>
              </div>

              <h4>
                Great conversations begin
                with great questions.
              </h4>

              <p>
                Before presenting a solution, ask
                questions that help you understand
                what your customer truly needs.
              </p>

              <Link to="/scenarios">
                Put it into practice
                <ArrowUpRight size={17} />
              </Link>
            </article>
          </section>

          <footer className="pd-footer">
            <span>
              © {new Date().getFullYear()} PitchPilot AI
            </span>

            <span>
              Practice. Improve. Succeed.
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default AgentDashboard;
