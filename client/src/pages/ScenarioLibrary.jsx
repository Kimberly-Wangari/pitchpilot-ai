
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  Compass,
  FilterX,
  Layers3,
  LoaderCircle,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";

import { getScenarios } from "../services/scenarioService";
import "./ScenarioLibrary.css";

const scenarioThemes = [
  {
    keywords: ["price", "cost", "budget"],
    icon: Wallet,
    accent: "violet",
    label: "VALUE COMMUNICATION",
  },
  {
    keywords: ["competitor", "comparison", "alternative"],
    icon: TrendingUp,
    accent: "cyan",
    label: "COMPETITIVE SELLING",
  },
  {
    keywords: ["needs", "discovery", "discover"],
    icon: Users,
    accent: "pink",
    label: "CUSTOMER DISCOVERY",
  },
  {
    keywords: ["hesitant", "decision", "uncertain"],
    icon: MessageCircle,
    accent: "orange",
    label: "CUSTOMER ENGAGEMENT",
  },
];

function getScenarioTheme(scenario) {
  const text = `${scenario.title || ""} ${scenario.category || ""}`
    .toLowerCase();

  return (
    scenarioThemes.find((theme) =>
      theme.keywords.some((keyword) => text.includes(keyword))
    ) || {
      icon: Target,
      accent: "violet",
      label: "SALES PRACTICE",
    }
  );
}

function formatLabel(value) {
  return String(value || "")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function ScenarioCard({ scenario, index }) {
  const theme = getScenarioTheme(scenario);
  const Icon = theme.icon;

  const difficulty = String(scenario.difficulty || "unspecified")
    .toLowerCase();

  const competencies = Array.isArray(scenario.target_competencies)
    ? scenario.target_competencies
    : [];

  return (
    <article
      className={`sl-card sl-accent-${theme.accent}`}
      style={{ "--sl-delay": `${Math.min(index, 8) * 70}ms` }}
    >
      <div className="sl-card-art">
        <div className="sl-card-orbit sl-card-orbit-one" />
        <div className="sl-card-orbit sl-card-orbit-two" />

        <div className="sl-card-art-icon">
          <Icon size={40} strokeWidth={1.5} />
        </div>

        <span className="sl-card-art-label">
          <Sparkles size={12} />
          {theme.label}
        </span>
      </div>

      <div className="sl-card-body">
        <div className="sl-card-meta">
          <span className={`sl-difficulty sl-difficulty-${difficulty}`}>
            <span className="sl-difficulty-dot" />
            {formatLabel(difficulty)}
          </span>

          <span className="sl-card-category">
            {formatLabel(scenario.category || "General")}
          </span>
        </div>

        <h3>{scenario.title}</h3>

        <p className="sl-card-description">
          {scenario.description || "Explore this sales training scenario."}
        </p>

        <div className="sl-card-skills">
          <div className="sl-card-skills-heading">
            <Target size={15} />
            <strong>Skills you'll practice</strong>
          </div>

          <div className="sl-skill-list">
            {competencies.length > 0 ? (
              competencies.slice(0, 4).map((competency, skillIndex) => (
                <span key={`${competency}-${skillIndex}`}>
                  {competency}
                </span>
              ))
            ) : (
              <span>Sales communication</span>
            )}

            {competencies.length > 4 && (
              <span>+{competencies.length - 4} more</span>
            )}
          </div>
        </div>

        <Link
          to={`/scenarios/${scenario.id}`}
          className="sl-card-action"
        >
          Explore scenario
          <ArrowRight size={17} />
        </Link>
      </div>
    </article>
  );
}

export default function ScenarioLibrary() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  useEffect(() => {
    let active = true;

    async function loadScenarios() {
      try {
        const data = await getScenarios();

        if (active) {
          setScenarios(data.scenarios || []);
          setError("");
        }
      } catch (err) {
        console.error("Scenario loading error:", err);

        if (active) {
          setError("Unable to load training scenarios. Please try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadScenarios();

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    return [
      ...new Set(
        scenarios
          .map((scenario) => scenario.category)
          .filter(Boolean)
      ),
    ].sort();
  }, [scenarios]);

  const filteredScenarios = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return scenarios.filter((scenario) => {
      const title = String(scenario.title || "").toLowerCase();
      const description = String(scenario.description || "").toLowerCase();

      const matchesSearch =
        title.includes(searchText) ||
        description.includes(searchText);

      const matchesCategory =
        category === "all" || scenario.category === category;

      const matchesDifficulty =
        difficulty === "all" ||
        String(scenario.difficulty || "").toLowerCase() === difficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [scenarios, search, category, difficulty]);

  const hasFilters =
    search.trim() !== "" ||
    category !== "all" ||
    difficulty !== "all";

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setDifficulty("all");
  };

  return (
    <div className="sl-page">
      <div className="sl-background-glow sl-glow-one" />
      <div className="sl-background-glow sl-glow-two" />

      <header className="sl-topbar">
        <div className="sl-container sl-topbar-inner">
          <Link to="/dashboard" className="sl-brand">
            <span className="sl-brand-icon">
              <Sparkles size={22} />
            </span>
            <span>
              PitchPilot<span className="sl-brand-ai">AI</span>
            </span>
          </Link>

          <nav className="sl-topbar-links" aria-label="Training navigation">
            <Link to="/dashboard">
              <BookOpen size={17} />
              Dashboard
            </Link>

            <span className="sl-nav-active">
              <Compass size={17} />
              Scenarios
            </span>
          </nav>

          <Link to="/dashboard" className="sl-back-button">
            <ArrowLeft size={17} />
            <span>Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="sl-container sl-main">
        <section className="sl-hero">
          <div className="sl-hero-grid" />
          <div className="sl-hero-orb" />

          <div className="sl-hero-content">
            <span className="sl-eyebrow">
              <Sparkles size={15} />
              THE TRAINING EXPERIENCE
            </span>

            <h1>
              Your next great pitch
              <br />
              <span>starts here.</span>
            </h1>

            <p>
              Step into realistic customer conversations,
              tackle challenging situations and develop
              the skills that make every interaction count.
            </p>

            <div className="sl-hero-pills">
              <span>
                <MessageCircle size={15} />
                Real-world scenarios
              </span>
              <span>
                <BrainCircuit size={15} />
                AI-powered practice
              </span>
              <span>
                <ShieldCheck size={15} />
                Learn at your pace
              </span>
            </div>
          </div>

          <div className="sl-hero-visual" aria-hidden="true">
            <div className="sl-visual-ring sl-ring-one" />
            <div className="sl-visual-ring sl-ring-two" />
            <div className="sl-visual-core">
              <BrainCircuit size={80} strokeWidth={1.2} />
            </div>

            <div className="sl-visual-float sl-float-one">
              <MessageCircle size={20} />
            </div>

            <div className="sl-visual-float sl-float-two">
              <Target size={20} />
            </div>

            <div className="sl-visual-float sl-float-three">
              <TrendingUp size={20} />
            </div>
          </div>
        </section>

        <section className="sl-library-section">
          <div className="sl-section-heading">
            <div>
              <span className="sl-section-label">
                <Layers3 size={15} />
                EXPLORE YOUR LIBRARY
              </span>

              <h2>Choose your training scenario</h2>

              <p>
                Find the right challenge and start building
                your conversational skills.
              </p>
            </div>

            {!loading && !error && (
              <div className="sl-count-badge">
                <span>{scenarios.length}</span>
                Total scenarios
              </div>
            )}
          </div>

          <div className="sl-filter-panel">
            <div className="sl-search-field">
              <Search size={19} />

              <input
                type="search"
                placeholder="Search scenarios, skills, topics..."
                aria-label="Search training scenarios"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X size={17} />
                </button>
              )}
            </div>

            <div className="sl-select-wrap">
              <select
                aria-label="Filter by category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="all">All categories</option>

                {categories.map((item) => (
                  <option key={item} value={item}>
                    {formatLabel(item)}
                  </option>
                ))}
              </select>

              <ChevronDown size={16} />
            </div>

            <div className="sl-select-wrap">
              <select
                aria-label="Filter by difficulty"
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value)}
              >
                <option value="all">All difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              <ChevronDown size={16} />
            </div>

            {hasFilters && (
              <button
                type="button"
                className="sl-clear-filters"
                onClick={clearFilters}
              >
                <FilterX size={16} />
                Clear
              </button>
            )}
          </div>

          <div className="sl-results-bar">
            <div>
              <span className="sl-results-dot" />

              {loading
                ? "Loading your training library..."
                : error
                ? "Unable to load scenarios"
                : `${filteredScenarios.length} scenario${
                    filteredScenarios.length === 1 ? "" : "s"
                  } available`}
            </div>

            {!loading && !error && (
              <span>
                {hasFilters
                  ? "Filtered results"
                  : "Explore and start practicing"}
              </span>
            )}
          </div>

          {loading ? (
            <div className="sl-state-panel" role="status">
              <LoaderCircle className="sl-spinner" size={34} />
              <h3>Preparing your training library</h3>
              <p>Loading the available scenarios...</p>
            </div>
          ) : error ? (
            <div className="sl-state-panel" role="alert">
              <ShieldCheck size={35} />
              <h3>Something went wrong</h3>
              <p>{error}</p>

              <button
                type="button"
                className="sl-state-action"
                onClick={() => window.location.reload()}
              >
                Try again
                <ArrowRight size={16} />
              </button>
            </div>
          ) : filteredScenarios.length === 0 ? (
            <div className="sl-state-panel">
              <Search size={36} />
              <h3>
                {scenarios.length === 0
                  ? "No scenarios available yet"
                  : "No matching scenarios"}
              </h3>
              <p>
                {scenarios.length === 0
                  ? "New training scenarios will appear here when available."
                  : "Try a different search term or adjust your filters."}
              </p>

              {hasFilters && (
                <button
                  type="button"
                  className="sl-state-action"
                  onClick={clearFilters}
                >
                  Clear filters
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          ) : (
            <div className="sl-scenario-grid">
              {filteredScenarios.map((scenario, index) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  index={index}
                />
              ))}
            </div>
          )}
        </section>

        <section className="sl-bottom-banner">
          <div>
            <span className="sl-section-label">
              <Sparkles size={15} />
              PRACTICE MAKES PROGRESS
            </span>

            <h2>Confidence is built one conversation at a time.</h2>

            <p>
              Pick a scenario, challenge yourself and
              discover what you can improve with practice.
            </p>
          </div>

          <div className="sl-bottom-icon" aria-hidden="true">
            <CheckCircle2 size={56} />
          </div>
        </section>

        <footer className="sl-footer">
          <span>
            © {new Date().getFullYear()} PitchPilot AI
          </span>

          <span>Practice. Improve. Succeed.</span>
        </footer>
      </main>
    </div>
  );
}
