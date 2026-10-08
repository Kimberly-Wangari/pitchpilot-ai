import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getTrainingSessionById } from "../services/trainingSessionService";

function TrainingSession() {
  const { sessionId } = useParams();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getTrainingSessionById(sessionId);

        if (active) {
          setSession(data.session);
        }
      } catch (err) {
        console.error("Training session error:", err);

        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load training session."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadSession();

    return () => {
      active = false;
    };
  }, [sessionId]);

  if (loading) {
    return (
      <main className="training-page">
        <p>Loading training session...</p>
      </main>
    );
  }

  if (error || !session) {
    return (
      <main className="training-page">
        <h2>Training session unavailable</h2>
        <p>{error}</p>

        <Link to="/scenarios">
          Back to Scenarios
        </Link>
      </main>
    );
  }

  return (
    <main className="training-page">
      <div className="training-container">

        <div className="training-header">
          <div>
            <p className="scenario-eyebrow">
              Live Training
            </p>

            <h1>{session.title}</h1>

            <p>
              Session #{session.id} • {session.difficulty}
            </p>
          </div>

          <Link
            to="/scenarios"
            className="secondary-button"
          >
            Back to Scenarios
          </Link>
        </div>

        <section className="scenario-details-card">
          <h2>Customer Persona</h2>
          <p>{session.customer_persona}</p>

          <h2>Situation</h2>
          <p>{session.situation}</p>

          <h2>Training Objective</h2>
          <p>{session.objective}</p>
        </section>

        <section className="conversation-panel">
          <div className="conversation-empty">
            <h2>Ready to begin?</h2>

            <p>
              Your simulated customer conversation
              will appear here.
            </p>
          </div>

          <div className="message-input-area">
            <input
              type="text"
              placeholder="Type your response..."
              disabled
            />

            <button
              type="button"
              className="primary-button"
              disabled
            >
              Send
            </button>
          </div>
        </section>

      </div>
    </main>
  );
}

export default TrainingSession;