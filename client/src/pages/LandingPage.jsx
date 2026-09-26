import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <h2>PitchPilot AI</h2>

        <div>
          <Link to="/login">
            Sign In
          </Link>

          <Link
            to="/register"
            className="nav-primary"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="landing-hero">
        <p className="eyebrow">
          AI-POWERED SALES TRAINING
        </p>

        <h1>
          Practice conversations.
          <br />
          Improve your sales.
        </h1>

        <p>
          Train with realistic AI-powered customer
          simulations, receive personalized feedback
          and develop the conversational skills needed
          for real sales interactions.
        </p>

        <Link
          to="/register"
          className="hero-button"
        >
          Start Training
        </Link>
      </main>
    </div>
  );
}

export default LandingPage;