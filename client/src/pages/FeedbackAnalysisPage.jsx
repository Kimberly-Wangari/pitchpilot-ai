
import { useState } from "react";
import "./FeedbackAnalysisPage.css";

// DEMO DATA — replace with backend results later
const demoSession = {
  id: "PP-001",
  customer: "Iron",
  scenario: "Handling a Price Objection",
  duration: "1hr 24min",
  turns: 16,
  completedAt: "11 October 2026",
  scores: [
    { name: "Communication Clarity", score: 85 },
    { name: "Objection Handling", score: 70 },
    { name: "Customer Engagement", score: 82 },
    { name: "Persuasive Selling", score: 75 },
    { name: "Empathy & Active Listening", score: 78 },
  ],
  strengths: [
    "Clearly explained the benefits of inventory management software.",
    "Maintained a professional and respectful tone.",
    "Responded to the customer's initial questions confidently.",
  ],
  improvements: [
    "Explore the customer's budget before suggesting a solution.",
    "Ask more open-ended questions to understand customer needs.",
    "Address pricing objections with specific value-based explanations.",
  ],
  recommendations: [
    "Practice handling price-sensitive customers.",
    "Focus on discovery questions before pitching a product.",
    "Try another scenario involving a skeptical customer.",
  ],
  conversation: [
    {
      role: "salesperson",
      message:
        "Hello Alex! Our inventory software can help you manage your stock more efficiently.",
    },
    {
      role: "customer",
      message:
        "That sounds interesting, but I'm running a small shop. How much would it cost?",
    },
    {
      role: "salesperson",
      message:
        "It could save you time and reduce errors in your inventory tracking.",
      feedback:
        "Good explanation of value, but the customer's pricing concern was not directly addressed.",
    },
    {
      role: "customer",
      message:
        "I understand, but I'm still worried about spending too much.",
    },
  ],
};

export default function FeedbackAnalysisPage({
  session = demoSession,
  onBack,
  onPracticeAgain,
}) {
  const [activeTab, setActiveTab] = useState("feedback");

  const scores = session.scores || [];
  const overallScore = scores.length
    ? Math.round(
        scores.reduce((sum, item) => sum + item.score, 0) /
          scores.length
      )
    : null;

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
              <span className="pp-analysis__demo">
                Demonstration scores
              </span>
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
