
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Compass,
  LoaderCircle,
  MessageCircle,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  Zap,
} from "lucide-react";

import { createTrainingSession } from "../services/trainingSessionService";
import { getScenarioById } from "../services/scenarioService";

import "./ScenarioDetails.css";

function formatLabel(value) {
  return String(value || "Not specified")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function DetailPanel({ icon: Icon, eyebrow, title, children, accent = "violet" }) {
  return (
    <article className={`sd-detail-panel sd-panel-${accent}`}>
      <div className="sd-panel-icon">
        <Icon size={22} />
      </div>

      <span className="sd-panel-eyebrow">{eyebrow}</span>
      <h3>{title}</h3>

      <div className="sd-panel-content">{children}</div>
    </article>
  );
}

export default function ScenarioDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadScenario() {
      setLoading(true);
      setError("");
      setScenario(null);
      setStartError("");

      try {
        const data = await getScenarioById(id);

        if (active) {
          setScenario(data.scenario || data);
        }
      } catch (err) {
        console.error("Scenario loading error:", err);

        if (active) {
          setError(
            err.response?.status === 404
              ? "This scenario could not be found."
              : "Unable to load this training scenario."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadScenario();

    return () => {
      active = false;
    };
  }, [id]);

  const handleStartTraining = async () => {
    if (!scenario || starting) return;

    try {
      setStarting(true);
      setStartError("");

      const data = await createTrainingSession(scenario.id);

      if (!data?.session?.id) {
        throw new Error("Training session ID was not returned.");
      }

      navigate(`/training/${data.session.id}`);
    } catch (err) {
      console.error("Start training error:", err);

      setStartError(
        err.response?.data?.message ||
          err.message ||
          "Unable to start the training session."
      );
    } finally {
      setStarting(false);
    }
  };

  const competencies = Array.isArray(scenario?.target_competencies)
    ? scenario.target_competencies
    : [];

  return (
    <div className="sd-page">
      <div className="sd-background-glow sd-glow-one" />
      <div className="sd-background-glow sd-glow-two" />

      <header className="sd-topbar">
        <div className="sd-container sd-topbar-inner">
          <Link to="/dashboard" className="sd-brand">
            <span className="sd-brand-icon">
              <Sparkles size={21} />
            </span>
            <span>
              PitchPilot<span>AI</span>
            </span>
          </Link>

          <nav className="sd-breadcrumb" aria-label="Breadcrumb">
            <Link to="/dashboard">Dashboard</Link>
            <ChevronRight size={15} />
            <Link to="/scenarios">Scenarios</Link>
            <ChevronRight size={15} />
            <strong>Details</strong>
          </nav>

          <Link to="/scenarios" className="sd-header-back">
            <ArrowLeft size={17} />
            <span>All scenarios</span>
          </Link>
        </div>
      </header>

      <main className="sd-container sd-main">
        <Link to="/scenarios" className="sd-back-link">
          <ArrowLeft size={17} />
          Back to scenario library
        </Link>

        {loading ? (
          <section className="sd-state-card" role="status">
            <LoaderCircle className="sd-spinner" size={36} />
            <h2>Preparing your scenario</h2>
            <p>Loading your training details...</p>
          </section>
        ) : error || !scenario ? (
          <section className="sd-state-card" role="alert">
            <Compass size={39} />
            <h2>Scenario unavailable</h2>
            <p>{error || "This scenario is currently unavailable."}</p>
            <Link to="/scenarios" className="sd-primary-button">
              Browse scenarios
              <ArrowRight size={17} />
            </Link>
          </section>
        ) : (
          <>
            <section className="sd-hero">
              <div className="sd-hero-grid" />
              <div className="sd-hero-glow" />

              <div className="sd-hero-content">
                <span className="sd-eyebrow">
                  <Sparkles size={15} />
                  YOUR TRAINING BRIEF
                </span>

                <div className="sd-hero-badges">
                  <span className="sd-difficulty">
                    <span className="sd-status-dot" />
                    {formatLabel(scenario.difficulty)} level
                  </span>

                  <span className="sd-category">
                    {formatLabel(scenario.category)}
                  </span>
                </div>

                <h1>{scenario.title}</h1>

                <p>
                  {scenario.description ||
                    "Prepare to practice your sales communication skills."}
                </p>

                <div className="sd-hero-actions">
                  <button
                    type="button"
                    className="sd-primary-button"
                    onClick={handleStartTraining}
                    disabled={starting}
                    aria-busy={starting}
                  >
                    {starting ? (
                      <>
                        <LoaderCircle className="sd-spinner" size={17} />
                        Starting session...
                      </>
                    ) : (
                      <>
                        <Play size={17} fill="currentColor" />
                        Start training
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>

                  <span className="sd-hero-note">
                    <ShieldCheck size={16} />
                    Practice at your own pace
                  </span>
                </div>

                {startError && (
                  <p className="sd-start-error" role="alert">
                    {startError}
                  </p>
                )}
              </div>

              <div className="sd-hero-visual" aria-hidden="true">
                <div className="sd-orbit sd-orbit-outer" />
                <div className="sd-orbit sd-orbit-inner" />

                <div className="sd-visual-core">
                  <BrainCircuit size={75} strokeWidth={1.2} />
                </div>

                <span className="sd-float sd-float-one">
                  <MessageCircle size={20} />
                </span>

                <span className="sd-float sd-float-two">
                  <Target size={20} />
                </span>

                <span className="sd-float sd-float-three">
                  <Zap size={20} />
                </span>
              </div>
            </section>

            <section className="sd-brief-section">
              <div className="sd-section-heading">
                <div>
                  <span className="sd-section-label">
                    <Compass size={15} />
                    BEFORE YOU BEGIN
                  </span>

                  <h2>Understand your scenario</h2>
                  <p>
                    Get familiar with the customer, situation
                    and objective before starting your practice.
                  </p>
                </div>
              </div>

              <div className="sd-details-grid">
                <DetailPanel
                  icon={UserRound}
                  eyebrow="CUSTOMER PROFILE"
                  title="Who you're speaking with"
                  accent="violet"
                >
                  <p>
                    {scenario.customer_persona ||
                      "Customer details have not been provided."}
                  </p>
                </DetailPanel>

                <DetailPanel
                  icon={MessageCircle}
                  eyebrow="THE CONTEXT"
                  title="What's happening"
                  accent="cyan"
                >
                  <p>
                    {scenario.situation ||
                      "Situation details have not been provided."}
                  </p>
                </DetailPanel>

                <DetailPanel
                  icon={Target}
                  eyebrow="YOUR MISSION"
                  title="What you need to achieve"
                  accent="pink"
                >
                  <p>
                    {scenario.objective ||
                      "Your training objective has not been specified."}
                  </p>
                </DetailPanel>

                <DetailPanel
                  icon={BrainCircuit}
                  eyebrow="SKILLS DEVELOPMENT"
                  title="Competencies you'll practice"
                  accent="orange"
                >
                  {competencies.length > 0 ? (
                    <div className="sd-competency-list">
                      {competencies.map((competency, index) => (
                        <span key={`${competency}-${index}`}>
                          <CheckCircle2 size={15} />
                          {competency}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p>
                      Focus on communicating clearly,
                      listening actively and understanding
                      customer needs.
                    </p>
                  )}
                </DetailPanel>
              </div>
            </section>

            <section className="sd-preparation">
              <div className="sd-preparation-heading">
                <span className="sd-section-label">
                  <Sparkles size={15} />
                  PREPARE TO PRACTICE
                </span>

                <h2>A few tips before you begin</h2>
              </div>

              <div className="sd-tips-grid">
                <div className="sd-tip">
                  <span className="sd-tip-number">01</span>
                  <h3>Listen carefully</h3>
                  <p>
                    Understand the customer's concern
                    before offering a solution.
                  </p>
                </div>

                <div className="sd-tip">
                  <span className="sd-tip-number">02</span>
                  <h3>Ask thoughtful questions</h3>
                  <p>
                    Explore customer needs instead
                    of making assumptions.
                  </p>
                </div>

                <div className="sd-tip">
                  <span className="sd-tip-number">03</span>
                  <h3>Communicate value</h3>
                  <p>
                    Explain how your solution relates
                    to the customer's priorities.
                  </p>
                </div>
              </div>
            </section>

            <section className="sd-start-panel">
              <div>
                <span className="sd-section-label">
                  <Zap size={15} />
                  TIME TO PUT YOUR SKILLS INTO ACTION
                </span>

                <h2>Ready for the conversation?</h2>

                <p>
                  Enter your simulated customer interaction
                  and start practicing your responses.
                </p>
              </div>

              <button
                type="button"
                className="sd-primary-button"
                onClick={handleStartTraining}
                disabled={starting}
              >
                {starting ? (
                  <>
                    <LoaderCircle className="sd-spinner" size={17} />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play size={17} fill="currentColor" />
                    Start training
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </section>

            {startError && (
              <p className="sd-bottom-error" role="alert">
                {startError}
              </p>
            )}
          </>
        )}

        <footer className="sd-footer">
          <span>© {new Date().getFullYear()} PitchPilot AI</span>
          <span>Practice. Improve. Succeed.</span>
        </footer>
      </main>
    </div>
  );
}
