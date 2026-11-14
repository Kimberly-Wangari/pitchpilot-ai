

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getTrainingSessionById,
  getTrainingSessionEvaluation,
} from "../services/trainingSessionService";

import {
  getConversationMessages,
} from "../services/conversationService";

import "./FeedbackAnalysisPage.css";


export default function FeedbackAnalysisPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] =
    useState("feedback");

  const [sessionData, setSessionData] =
    useState(null);

  const [evaluation, setEvaluation] =
    useState(null);

  const [conversation, setConversation] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function loadFeedback() {
      try {
        setLoading(true);
        setError("");

        const [
          sessionResponse,
          evaluationResponse,
          conversationResponse,
        ] = await Promise.all([
          getTrainingSessionById(sessionId),
          getTrainingSessionEvaluation(sessionId),
          getConversationMessages(sessionId),
        ]);

        if (!mounted) return;

        setSessionData(sessionResponse.session);
        setEvaluation(evaluationResponse.evaluation);
        setConversation(
          conversationResponse.messages || []
        );

      } catch (err) {
        if (mounted) {
          setError(
            err.response?.data?.message ||
            "Unable to load your feedback report."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadFeedback();

    return () => {
      mounted = false;
    };
  }, [sessionId]);

  const onBack = () => navigate("/dashboard");

  const onPracticeAgain = () =>
    navigate("/scenarios");

  if (loading) {
    return <p>Loading your performance report...</p>;
  }

  if (error) {
    return (
      <main className="pp-analysis">
        <p role="alert">{error}</p>
        <button onClick={onBack}>
          Back to Dashboard
        </button>
      </main>
    );
  }

  if (!sessionData || !evaluation) {
    return <p>Feedback report not found.</p>;
  }

  // Convert Gemini's 0–5 scores into percentages
  const scores = Object.entries(
    evaluation.scores || {}
  )
    .filter(([, value]) =>
      typeof value === "number" &&
      Number.isFinite(value)
    )
    .map(([name, value]) => ({
      name,
      score: Math.round(value * 20),
    }));

  const overallScore =
    evaluation.overall_score == null
      ? null
      : Number(evaluation.overall_score);

  const session = {
    id: sessionId,
    customer:
      typeof sessionData.customer_persona === "string"
        ? sessionData.customer_persona
        : "Simulated Customer",
    scenario: sessionData.title,
    duration: "Not recorded",
    turns: conversation.length,
    scores,
    strengths: evaluation.strengths || [],
    improvements: evaluation.improvements || [],
    recommendations: evaluation.improvements || [],
    feedback: evaluation.feedback || "",
    conversation: conversation.map((msg) => ({
      role:
        msg.sender === "customer"
          ? "customer"
          : "salesperson",
      message: msg.content,
    })),
  };


  return (
    <main className="pp-analysis">
      <div className="pp-analysis__top">
        <div>
          <button
            className="pp-analysis__back"
            type="button"
            onClick={onBack}
            disabled={!onBack}
          >
            ← Back to Dashboard
          </button>

          <p className="pp-analysis__eyebrow">
            TRAINING SESSION RESULTS
          </p>

          <h1>Session Feedback & Analysis</h1>
          <p className="pp-analysis__subtitle">
            Review your performance and discover opportunities
            to improve your sales conversations.
          </p>
        </div>

        <span className="pp-analysis__status">
          ✓ Session Completed
        </span>
      </div>

      <section className="pp-analysis__summary">
        <div>
          <span>Customer Persona</span>
          <strong>{session.customer}</strong>
        </div>
        <div>
          <span>Training Scenario</span>
          <strong>{session.scenario}</strong>
        </div>
        <div>
          <span>Duration</span>
          <strong>{session.duration}</strong>
        </div>
        <div>
          <span>Conversation Turns</span>
          <strong>{session.turns}</strong>
        </div>
      </section>

      <div className="pp-analysis__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "feedback"}
          className={activeTab === "feedback" ? "active" : ""}
          onClick={() => setActiveTab("feedback")}
        >
          Performance Feedback
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "conversation"}
          className={activeTab === "conversation" ? "active" : ""}
          onClick={() => setActiveTab("conversation")}
        >
          Conversation Analysis
        </button>
      </div>

      {activeTab === "feedback" ? (
        <div className="pp-analysis__content" role="tabpanel">
          <div className="pp-analysis__performance">
            <section className="pp-analysis__card pp-analysis__overall">
              <h2>Overall Performance</h2>
              <div className="pp-analysis__score">
                {overallScore ?? "—"}
                <small>/100</small>
              </div>
              <p>
                Your performance summary across the assessed
                sales competencies.
              </p>
              
            </section>

            <section className="pp-analysis__card">
              <h2>Competency Breakdown</h2>
              <div className="pp-analysis__metrics">
                {scores.map((metric) => (
                  <div key={metric.name}>
                    <div className="pp-analysis__metric-label">
                      <span>{metric.name}</span>
                      <strong>{metric.score}%</strong>
                    </div>
                    <div
                      className="pp-analysis__track"
                      role="progressbar"
                      aria-label={metric.name}
                      aria-valuenow={metric.score}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="pp-analysis__fill"
                        style={{ width: `${metric.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="pp-analysis__feedback-grid">
            <FeedbackCard
              title="Your Strengths"
              symbol="✓"
              items={session.strengths}
            />
            <FeedbackCard
              title="Areas for Improvement"
              symbol="↗"
              items={session.improvements}
            />
          </div>
          <p>{session.feedback}</p>

          <section className="pp-analysis__card">
            <h2>Personalized Recommendations</h2>
            <p className="pp-analysis__muted">
              Suggested focus areas for your next practice session.
            </p>
            <ol className="pp-analysis__recommendations">
              {(session.recommendations || []).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ol>
          </section>
        </div>
      ) : (
        <div className="pp-analysis__content" role="tabpanel">
          <section className="pp-analysis__card">
            <h2>Conversation Review</h2>
            <p className="pp-analysis__muted">
              Revisit the conversation and review feedback on
              important moments.
            </p>

            <div className="pp-analysis__conversation">
              {(session.conversation || []).map((turn, index) => (
                <div
                  className={`pp-analysis__turn pp-analysis__turn--${turn.role}`}
                  key={index}
                >
                  <span className="pp-analysis__speaker">
                    {turn.role === "customer"
                      ? `Customer (${session.customer})`
                      : "Sales Agent"}
                  </span>
                  <p>{turn.message}</p>

                  {turn.feedback && (
                    <div className="pp-analysis__turn-feedback">
                      <strong>AI Feedback</strong>
                      <p>{turn.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      <div className="pp-analysis__actions">
        <button
          type="button"
          className="pp-analysis__button pp-analysis__button--secondary"
          onClick={onBack}
          disabled={!onBack}
        >
          Back to Dashboard
        </button>

        <button
          type="button"
          className="pp-analysis__button pp-analysis__button--primary"
          onClick={onPracticeAgain}
          disabled={!onPracticeAgain}
        >
          Practice Again →
        </button>
      </div>
    </main>
  );
}

function FeedbackCard({ title, symbol, items = [] }) {
  return (
    <section className="pp-analysis__card">
      <h2>
        <span className="pp-analysis__card-symbol">{symbol}</span>
        {title}
      </h2>
      <ul className="pp-analysis__feedback-list">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
