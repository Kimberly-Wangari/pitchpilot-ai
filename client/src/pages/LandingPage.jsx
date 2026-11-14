
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import "./LandingPage.css";

const features = [
  {
    number: "01",
    icon: Sparkles,
    title: "AI customer role-play",
    description:
      "Practice realistic customer interactions without the pressure of a live sales environment.",
  },
  {
    number: "02",
    icon: Target,
    title: "Scenario-based training",
    description:
      "Work through price objections, competitor comparisons, customer discovery and difficult decisions.",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Personalized learning",
    description:
      "Build conversational confidence through repeated practice and reflection.",
  },
  {
    number: "04",
    icon: BarChart3,
    title: "Training dashboard",
    description:
      "Access scenarios, manage your sessions and keep your practice organized in one place.",
  },
];

const benefits = [
  {
    icon: MessageCircle,
    text: "Realistic customer interactions",
  },
  {
    icon: BarChart3,
    text: "Personalized practice",
  },
  {
    icon: CheckCircle2,
    text: "Build confidence and sales readiness",
  },
];

const experienceBenefits = [
  {
    icon: MessageCircle,
    text: "Practice natural customer conversations",
  },
  {
    icon: Target,
    text: "Explore different sales scenarios",
  },
  {
    icon: BarChart3,
    text: "Develop your communication skills",
  },
  {
    icon: Users,
    text: "Build confidence before real-world interactions",
  },
];

function Brand() {
  return (
    <Link to="/" className="lp-brand">
      <span className="lp-brand-icon">
        <Sparkles size={24} strokeWidth={2.5} />
      </span>

      <span>
        PitchPilot<span className="lp-brand-ai">AI</span>
      </span>
    </Link>
  );
}

function ConversationPreview() {
  return (
    <div className="lp-chat-preview">
      <div className="lp-chat-window-bar">
        <div className="lp-window-dots">
          <span />
          <span />
          <span />
        </div>

        <span>LIVE TRAINING PREVIEW</span>

        <div className="lp-preview-status">
          <span />
          Practice
        </div>
      </div>

      <div className="lp-chat-content">
        <div className="lp-chat-customer">
          <div className="lp-chat-avatar">AI</div>

          <div>
            <strong>Customer simulation</strong>
            <p>Price objection scenario</p>
          </div>
        </div>

        <div className="lp-chat-bubble lp-chat-bubble-customer">
          Your product looks interesting, but the price is
          higher than I expected.
        </div>

        <div className="lp-chat-bubble lp-chat-bubble-agent">
          I understand. Could I ask what you're comparing
          it against?
        </div>

        <div className="lp-chat-bubble lp-chat-bubble-customer">
          Another provider offers something similar for less.
          Why should I choose you?
        </div>

        <div className="lp-chat-input">
          <span>Practice your next response...</span>

          <Link
            to="/register"
            aria-label="Start practicing"
            className="lp-chat-send"
          >
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="lp-page">
      {/* NAVIGATION */}
      <header className="lp-header">
        <nav className="lp-nav">
          <Brand />

          <div className="lp-nav-links">
            <a href="#features">Features</a>
            <a href="#experience">Experience</a>
            <a href="#how-it-works">How it works</a>
            <a href="#about">About</a>
          </div>

          <div className="lp-nav-actions">
            <Link to="/login" className="lp-login-link">
              Log in
            </Link>

            <Link to="/register" className="lp-signup-button">
              Sign up
              <ArrowRight size={17} />
            </Link>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-container lp-hero-grid">
          <div className="lp-hero-content">
            <span className="lp-eyebrow">
              YOUR PERSONAL AI SALES COACH
            </span>

            <h1>
              Practice today.
              <br />
              <span>Perform better</span>
              <br />
              tomorrow.
            </h1>

            <p className="lp-hero-description">
              Build real-world sales skills through realistic
              AI customer conversations, personalized practice
              and continuous learning.
            </p>

            <div className="lp-hero-actions">
              <Link to="/register" className="lp-button-primary">
                Start practicing
                <ArrowRight size={18} />
              </Link>

              <Link to="/login" className="lp-button-secondary">
                Explore scenarios
              </Link>
            </div>

            <div className="lp-hero-benefits">
              {benefits.map(({ icon: Icon, text }) => (
                <div className="lp-hero-benefit" key={text}>
                  <span className="lp-benefit-icon">
                    <Icon size={20} />
                  </span>

                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lp-hero-visual">
            <div className="lp-hero-image-wrap">
              <img
                src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=85"
                alt="Professionals collaborating in a modern workspace"
              />
            </div>

            <div className="lp-floating-card lp-float-one">
              <MessageCircle size={20} />
              <span>AI role-play conversations</span>
            </div>

            <div className="lp-floating-card lp-float-two">
              <BarChart3 size={20} />
              <span>Personalized practice</span>
            </div>

            <div className="lp-floating-card lp-float-three">
              <TrendingUp size={20} />
              <span>Improve sales skills</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="lp-features-section">
        <div className="lp-container">
          <div className="lp-section-heading">
            <span className="lp-eyebrow">WHY PITCHPILOT AI</span>

            <h2>
              Everything you need to master
              <br />
              sales conversations.
            </h2>
          </div>

          <div className="lp-features-grid">
            {features.map(({ number, icon: Icon, title, description }) => (
              <div className="lp-feature-card" key={number}>
                <span className="lp-feature-number">{number}</span>

                <div className="lp-feature-icon">
                  <Icon size={27} />
                </div>

                <h3>{title}</h3>

                <p>{description}</p>

                <ArrowUpRight
                  className="lp-feature-arrow"
                  size={19}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section id="experience" className="lp-experience-section">
        <div className="lp-container lp-experience-grid">
          <ConversationPreview />

          <div className="lp-experience-content">
            <span className="lp-eyebrow">
              INSIDE THE EXPERIENCE
            </span>

            <h2>
              Realistic conversations.
              <br />
              <span>Real progress.</span>
            </h2>

            <p>
              Engage in scenario-based role-play with simulated
              customers. Practice handling objections, asking
              thoughtful questions and communicating value
              effectively.
            </p>

            <div className="lp-experience-benefits">
              {experienceBenefits.map(({ icon: Icon, text }) => (
                <div className="lp-experience-benefit" key={text}>
                  <div className="lp-experience-benefit-icon">
                    <Icon size={20} />
                  </div>

                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="lp-steps-section">
        <div className="lp-container">
          <div className="lp-section-heading lp-centered">
            <span className="lp-eyebrow">
              SIMPLE, PRACTICAL LEARNING
            </span>

            <h2>How PitchPilot AI works</h2>

            <p>
              A simple training journey designed around
              realistic sales conversations.
            </p>
          </div>

          <div className="lp-steps-grid">
            <div className="lp-step-card">
              <span>01</span>
              <Target size={28} />
              <h3>Choose a scenario</h3>
              <p>
                Select a customer situation and review
                the training objective.
              </p>
            </div>

            <div className="lp-step-card">
              <span>02</span>
              <MessageCircle size={28} />
              <h3>Practice your response</h3>
              <p>
                Take part in a simulated sales conversation
                and apply your skills.
              </p>
            </div>

            <div className="lp-step-card">
              <span>03</span>
              <TrendingUp size={28} />
              <h3>Keep improving</h3>
              <p>
                Reflect on your approach and strengthen
                your sales communication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section id="about" className="lp-cta-section">
        <div className="lp-container">
          <div className="lp-cta-banner">
            <div className="lp-cta-content">
              <span>READY TO IMPROVE YOUR SALES SKILLS?</span>

              <h2>
                Start your AI-powered
                <br />
                training journey today.
              </h2>

              <p>
                Join PitchPilot AI and transform the way
                you learn, practice and grow as a
                sales professional.
              </p>

              <Link to="/register" className="lp-button-primary">
                Get started
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="lp-cta-benefits">
              <span>
                <MessageCircle size={20} />
                Realistic scenarios
              </span>

              <span>
                <BarChart3 size={20} />
                Personalized practice
              </span>

              <span>
                <TrendingUp size={20} />
                Lasting improvement
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-container lp-footer-content">
          <Brand />

          <p>
            Build confidence. Practice smarter.
            Perform better.
          </p>

          <span>
            © {new Date().getFullYear()} PitchPilot AI
          </span>
        </div>
      </footer>
    </div>
  );
}
