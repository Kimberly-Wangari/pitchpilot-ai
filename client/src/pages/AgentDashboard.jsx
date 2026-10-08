import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

function AgentDashboard() {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h2>PitchPilot AI</h2>
          <span>Sales Training Platform</span>
        </div>

        <div className="dashboard-user">
          <span>
            {user.firstName} {user.lastName}
          </span>

          <button onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <p className="dashboard-eyebrow">
          AGENT DASHBOARD
        </p>

        <h1>
          Welcome back, {user.firstName}.
        </h1>

        <p>
          Your personalized sales training journey
          starts here.
        </p>

        <section className="dashboard-grid">
          <article className="dashboard-card">
            <h3>Start Training</h3>

            <p>
              Practice realistic conversations with
              AI-powered customers.
            </p>

            <Link to="/scenarios">
              <button>
                Browse Scenarios
              </button>
            </Link>
          </article>

          <article className="dashboard-card">
            <h3>Training Sessions</h3>

            <strong>0</strong>

            <p>
              Complete your first simulation to begin
              tracking progress.
            </p>
          </article>

          <article className="dashboard-card">
            <h3>Current Focus</h3>

            <p>
              Complete your first session to receive
              personalized recommendations.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}

export default AgentDashboard;