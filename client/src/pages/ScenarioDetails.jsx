import { useEffect, useState } from "react";
import { Link, useNavigate,useParams } from "react-router-dom";
import { createTrainingSession } from "../services/trainingSessionService";
import { getScenarioById } from "../services/scenarioService";

function ScenarioDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

const [starting, setStarting] = useState(false);
const [startError, setStartError] = useState("");

  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const handleStartTraining = async () => {
  try {
    setStarting(true);
    setStartError("");

    const data = await createTrainingSession(scenario.id);

    navigate(`/training/${data.session.id}`);
  } catch (error) {
    console.error("Start training error:", error);

    setStartError(
      error.response?.data?.message ||
        "Unable to start the training session."
    );
  } finally {
    setStarting(false);
  }
};
  useEffect(() => {
    const loadScenario = async () => {
      try {
        const data = await getScenarioById(id);

        // Supports either { scenario: {...} } or direct {...}
        setScenario(data.scenario || data);
      } catch (err) {
        console.error("Scenario loading error:", err);

        if (err.response?.status === 404) {
          setError("Scenario not found.");
        } else {
          setError("Unable to load this training scenario.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadScenario();
  }, [id]);

  if (loading) {
    return (
      <main className="scenario-details-page">
        <p>Loading scenario...</p>
      </main>
    );
  }

  if (error || !scenario) {
    return (
      <main className="scenario-details-page">
        <div className="scenario-details-card">
          <h1>Scenario unavailable</h1>
          <p>{error}</p>

          <Link to="/scenarios" className="secondary-button">
            Back to Scenarios
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="scenario-details-page">
      <div className="details-navigation">
        <Link to="/scenarios" className="secondary-button">
          ← Back to Scenarios
        </Link>
      </div>

      <section className="scenario-details-card">
        <div className="scenario-card-top">
          <span className={`difficulty ${scenario.difficulty}`}>
            {scenario.difficulty}
          </span>

          <span className="scenario-category">
            {scenario.category}
          </span>
        </div>

        <h1>{scenario.title}</h1>

        <p className="scenario-details-description">
          {scenario.description}
        </p>

        <div className="details-grid">
          <div className="detail-section">
            <span className="detail-label">Customer Persona</span>
            <h2>Who you're speaking with</h2>
            <p>{scenario.customer_persona}</p>
          </div>

          <div className="detail-section">
            <span className="detail-label">Situation</span>
            <h2>What's happening</h2>
            <p>{scenario.situation}</p>
          </div>
        </div>

        <div className="detail-section objective-section">
          <span className="detail-label">Training Objective</span>
          <h2>Your goal</h2>
          <p>{scenario.objective}</p>
        </div>

        <div className="detail-section">
          <span className="detail-label">Competencies</span>
          <h2>Skills you'll practice</h2>

          <div className="competency-list">
            {scenario.target_competencies?.map((competency) => (
              <span key={competency}>{competency}</span>
            ))}
          </div>
        </div>

        <div className="start-training-section">
          <div>
            <h2>Ready to practice?</h2>
            <p>
              Start a simulated customer conversation based on this scenario.
            </p>
          </div>

          <button
  type="button"
  className="primary-button"
  onClick={handleStartTraining}
  disabled={starting}
>
  {starting ? "Starting..." : "Start Training"}
</button>
          {startError && (
  <p className="scenario-error">{startError}</p>
)}
        </div>
      </section>
    </main>
  );
}

export default ScenarioDetails;