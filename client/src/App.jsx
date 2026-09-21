import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [apiStatus, setApiStatus] = useState("Checking API...");

  useEffect(() => {
    fetch("http://localhost:5000/api/health")
      .then((response) => response.json())
      .then((data) => {
        setApiStatus(data.status);
      })
      .catch(() => {
        setApiStatus("offline");
      });
  }, []);

  return (
    <div className="app">
      <header className="navbar">
        <h2>PitchPilot AI</h2>

        <nav>
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <button>Login</button>
        </nav>
      </header>

      <main className="hero">
        <div className="hero-content">
          <p className="tag">AI-POWERED SALES TRAINING</p>

          <h1>
            Practice conversations.
            <br />
            Improve your sales.
          </h1>

          <p className="description">
            Train with realistic AI-powered customer simulations, receive
            personalized feedback and develop the conversational skills needed
            for real sales interactions.
          </p>

          <div className="actions">
            <button className="primary-button">
              Start Training
            </button>

            <button className="secondary-button">
              Learn More
            </button>
          </div>
        </div>
      </main>
      <footer className="footer">
        <p>API Status: {apiStatus}</p>
      </footer>
    </div>
  );
}

export default App;