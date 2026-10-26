
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Award,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Flag,
  LoaderCircle,
  MessageCircle,
  PanelRightClose,
  PanelRightOpen,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  Zap,
} from "lucide-react";

import {
  getTrainingSessionById,
  endAndEvaluateTrainingSession,
  getTrainingSessionEvaluation,
} from "../services/trainingSessionService";

import {
  getConversationMessages,
  sendConversationMessage,
} from "../services/conversationService";

import "./TrainingSession.css";

// ------------------------------------
// Helpers
// ------------------------------------

function formatLabel(value) {
  return String(value || "Not specified")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

// ------------------------------------
// Chat Message Component
// ------------------------------------

function ChatMessage({ message }) {
  const isAgent = message.sender === "agent";
  const isCustomer = message.sender === "customer";

  const timestamp = message.created_at || message.createdAt;
  const date = timestamp ? new Date(timestamp) : null;

  const time =
    date && !Number.isNaN(date.getTime())
      ? date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  return (
    <div
      className={`pp-chat-row ${
        isAgent ? "pp-chat-agent" : ""
      }`}
    >
      {!isAgent && (
        <div className="pp-chat-avatar pp-customer-avatar">
          {isCustomer ? (
            <UserRound size={18} />
          ) : (
            <Sparkles size={18} />
          )}
        </div>
      )}

      <div className="pp-chat-message">
        <div className="pp-chat-message-meta">
          <strong>
            {isAgent
              ? "You"
              : isCustomer
              ? "Customer"
              : "System"}
          </strong>

          {time && <span>{time}</span>}
        </div>

        <div className="pp-chat-bubble">
          {message.content}
        </div>
      </div>

      {isAgent && (
        <div className="pp-chat-avatar pp-agent-avatar">
          <UserRound size={18} />
        </div>
      )}
    </div>
  );
}

// ------------------------------------
// Training Session Page
// ------------------------------------

export default function TrainingSession() {
  const { sessionId } = useParams();

  // Session state
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Conversation state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [messageError, setMessageError] = useState("");
  const [loadingMessages, setLoadingMessages] =
    useState(true);

  // Layout state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tipsOpen, setTipsOpen] = useState(true);

  // Evaluation state
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [evaluationError, setEvaluationError] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  const messagesEndRef = useRef(null);

  // ------------------------------------
  // Load training session
  // ------------------------------------

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      setLoading(true);
      setError("");
      setSession(null);
      setEvaluation(null);
      setShowFeedback(false);
      setEvaluationError("");

      try {
        const data = await getTrainingSessionById(sessionId);

        if (mounted) {
          setSession(data.session);
        }
      } catch (err) {
        console.error("Training session error:", err);

        if (mounted) {
          setError(
            err.response?.data?.message ||
              "Unable to load training session."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      mounted = false;
    };
  }, [sessionId]);

  // ------------------------------------
  // Load saved evaluation
  // ------------------------------------

  useEffect(() => {
    let mounted = true;

    async function loadSavedEvaluation() {
      if (session?.status !== "completed") {
        return;
      }

      try {
        const data = await getTrainingSessionEvaluation(
          sessionId
        );

        if (mounted) {
          setEvaluation(data.evaluation);
        }
      } catch (err) {
        console.error(
          "Load saved evaluation error:",
          err
        );

        if (mounted) {
          setEvaluationError(
            err.response?.data?.message ||
              "Unable to load saved evaluation."
          );
        }
      }
    }

    loadSavedEvaluation();

    return () => {
      mounted = false;
    };
  }, [sessionId, session?.status]);

  // ------------------------------------
  // Load conversation messages
  // ------------------------------------

  useEffect(() => {
    let mounted = true;

    async function loadMessages() {
      setLoadingMessages(true);
      setMessageError("");
      setMessages([]);

      try {
        const data = await getConversationMessages(
          sessionId
        );

        if (mounted) {
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error(
          "Conversation loading error:",
          err
        );

        if (mounted) {
          setMessageError(
            err.response?.data?.message ||
              "Unable to load conversation history."
          );
        }
      } finally {
        if (mounted) {
          setLoadingMessages(false);
        }
      }
    }

    loadMessages();

    return () => {
      mounted = false;
    };
  }, [sessionId]);

  // ------------------------------------
  // Scroll to latest message
  // ------------------------------------

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  // ------------------------------------
  // Check session status
  // ------------------------------------

  const active = session?.status === "in_progress";

  const hasAgentMessage = messages.some(
    (message) => message?.sender === "agent"
  );

  const hasCustomerMessage = messages.some(
    (message) => message?.sender === "customer"
  );

  const canEvaluate =
    active &&
    !evaluating &&
    !sending &&
    !loadingMessages &&
    hasAgentMessage &&
    hasCustomerMessage;

  // ------------------------------------
  // End and evaluate training session
  // ------------------------------------

  const handleEndAndEvaluate = async () => {
    if (!canEvaluate) {
      return;
    }

    const confirmed = window.confirm(
      "End this training session and generate your performance feedback? You won't be able to send more messages afterward."
    );

    if (!confirmed) {
      return;
    }

    setEvaluating(true);
    setEvaluationError("");

    try {
      const result =
        await endAndEvaluateTrainingSession(sessionId);

      setEvaluation(result.evaluation);
      setShowFeedback(true);

      setSession((previous) => ({
        ...previous,
        status: "completed",
        completed_at: new Date().toISOString(),
      }));
    } catch (err) {
      console.error(
        "Training evaluation error:",
        err
      );

      setEvaluationError(
        err.response?.data?.message ||
          "Unable to evaluate your training session. Please try again."
      );
    } finally {
      setEvaluating(false);
    }
  };

  // ------------------------------------
  // Send conversation message
  // ------------------------------------

  const handleSendMessage = async (event) => {
    event.preventDefault();

    const text = newMessage.trim();

    if (
      !text ||
      sending ||
      evaluating ||
      loadingMessages ||
      !active
    ) {
      return;
    }

    setSending(true);
    setMessageError("");

    try {
      const data = await sendConversationMessage(
        sessionId,
        text
      );

      // Preserve the agent message if refreshing fails.
      if (data.conversationMessage) {
        setMessages((previous) => [
          ...previous,
          data.conversationMessage,
        ]);
      }

      setNewMessage("");

      // Refresh to include the customer response.
      try {
        const refreshed =
          await getConversationMessages(sessionId);

        if (Array.isArray(refreshed.messages)) {
          setMessages(refreshed.messages);
        }
      } catch (refreshError) {
        console.warn(
          "Message history refresh failed:",
          refreshError
        );
      }
    } catch (err) {
      console.error("Send message error:", err);

      setMessageError(
        err.response?.data?.message ||
          "Unable to send your message. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  // ------------------------------------
  // Enter key handling
  // ------------------------------------

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  // ------------------------------------
  // Render
  // ------------------------------------

  return (
    <div className="pp-training-page">

      {/* Navigation */}

      <header className="pp-training-navbar">
        <Link
          to="/dashboard"
          className="pp-training-brand"
        >
          <span className="pp-brand-symbol">
            <Sparkles size={21} />
          </span>
          PitchPilot<span>AI</span>
        </Link>

        <div className="pp-training-nav-right">
          {session && (
            <span
              className={`pp-live-status ${
                active ? "active" : ""
              }`}
            >
              <span className="pp-status-dot" />
              {formatLabel(session.status)}
            </span>
          )}

          <Link
            to="/scenarios"
            className="pp-exit-button"
          >
            <ArrowLeft size={17} />
            <span>Exit workspace</span>
          </Link>
        </div>
      </header>

      {/* Loading */}

      {loading ? (
        <main
          className="pp-training-state"
          role="status"
        >
          <LoaderCircle
            className="pp-spin"
            size={38}
          />

          <h2>Preparing your training workspace</h2>
          <p>Loading your session...</p>
        </main>
      ) : error || !session ? (
        <main
          className="pp-training-state"
          role="alert"
        >
          <CircleAlert size={40} />

          <h2>Session unavailable</h2>

          <p>
            {error || "Training session not found."}
          </p>

          <Link
            to="/scenarios"
            className="pp-state-link"
          >
            Back to scenarios
          </Link>
        </main>
      ) : (

        /* Main workspace */

        <main
          className={`pp-training-layout ${
            !sidebarOpen ? "expanded" : ""
          }`}
        >
          <section className="pp-conversation-workspace">

            {/* Conversation header */}

            <div className="pp-conversation-header">

              <div>
                <span className="pp-section-eyebrow">
                  <Zap size={14} />
                  LIVE SALES PRACTICE
                </span>

                <h1>{session.title}</h1>

                <div className="pp-session-meta">
                  <span>
                    <BookOpen size={14} />
                    Session #{session.id}
                  </span>

                  <span>
                    <Target size={14} />
                    {formatLabel(session.difficulty)}
                  </span>
                </div>
              </div>

              {/* End session and feedback buttons */}

              <div className="pp-training-header-actions">

                {active && (
                  <button
                    type="button"
                    className="pp-end-session-button"
                    onClick={handleEndAndEvaluate}
                    disabled={!canEvaluate}
                  >
                    {evaluating ? (
                      <LoaderCircle
                        size={17}
                        className="pp-spin"
                      />
                    ) : (
                      <Flag size={17} />
                    )}

                    {evaluating
                      ? "Evaluating..."
                      : "End & Evaluate"}
                  </button>
                )}

                {!active && evaluation && (
                  <button
                    type="button"
                    className="pp-view-feedback-button"
                    onClick={() =>
                      setShowFeedback(
                        (previous) => !previous
                      )
                    }
                  >
                    <Award size={17} />

                    {showFeedback
                      ? "Hide Feedback"
                      : "View Feedback"}
                  </button>
                )}
              </div>

              {/* Sidebar toggle */}

              <button
                type="button"
                className="pp-sidebar-toggle"
                onClick={() =>
                  setSidebarOpen((open) => !open)
                }
                aria-label={
                  sidebarOpen
                    ? "Hide scenario briefing"
                    : "Show scenario briefing"
                }
                aria-expanded={sidebarOpen}
              >
                {sidebarOpen ? (
                  <PanelRightClose size={20} />
                ) : (
                  <PanelRightOpen size={20} />
                )}
              </button>
            </div>

            {/* Conversation area */}

            <div className="pp-conversation-scroll">
              <div className="pp-conversation-inner">

                <div className="pp-chat-divider">
                  <span>TRAINING CONVERSATION</span>
                </div>

                {loadingMessages ? (
                  <div
                    className="pp-empty-conversation"
                    role="status"
                  >
                    <LoaderCircle
                      className="pp-spin"
                      size={34}
                    />

                    <h2>Loading messages</h2>
                  </div>
                ) : messages.length === 0 ? (

                  /* Empty conversation */

                  <div className="pp-empty-conversation">
                    <div className="pp-empty-illustration">
                      <div className="pp-empty-orbit" />
                      <MessageCircle size={43} />
                    </div>

                    <span className="pp-section-eyebrow">
                      <Sparkles size={14} />
                      YOUR PRACTICE SPACE
                    </span>

                    <h2>
                      Every great pitch starts with a
                      conversation.
                    </h2>

                    <p>
                      Review the customer's situation,
                      think about your approach and
                      send your first message when
                      you're ready.
                    </p>

                    <div className="pp-conversation-prompts">
                      <span>
                        <CheckCircle2 size={15} />
                        Ask thoughtful questions
                      </span>

                      <span>
                        <CheckCircle2 size={15} />
                        Listen actively
                      </span>

                      <span>
                        <CheckCircle2 size={15} />
                        Communicate value
                      </span>
                    </div>
                  </div>
                ) : (

                  /* Chat messages */

                  <div
                    className="pp-message-list"
                    aria-live="polite"
                  >
                    {messages
                      .filter(Boolean)
                      .map((message, index) => (
                        <ChatMessage
                          key={message.id ?? index}
                          message={message}
                        />
                      ))}
                  </div>
                )}

                {sending && (
                  <div
                    className="pp-processing-message"
                    role="status"
                  >
                    <LoaderCircle
                      className="pp-spin"
                      size={16}
                    />

                    Saving your response...
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Evaluation error */}

            {evaluationError && (
              <div
                className="pp-evaluation-error"
                role="alert"
              >
                <CircleAlert size={17} />
                <span>{evaluationError}</span>
              </div>
            )}

            {/* Evaluation progress */}

            {evaluating && (
              <div
                className="pp-evaluation-loading"
                role="status"
              >
                <LoaderCircle
                  size={20}
                  className="pp-spin"
                />

                <span>
                  Evaluating your sales conversation...
                </span>
              </div>
            )}

            {/* Performance report */}

            {showFeedback && evaluation && (
              <section className="pp-feedback-panel">

                <div className="pp-feedback-heading">
                  <div>
                    <span className="pp-section-eyebrow">
                      <Award size={15} />
                      TRAINING PERFORMANCE
                    </span>

                    <h2>Your Performance Report</h2>
                    <p>{session.title}</p>
                  </div>

                  <div className="pp-overall-score">
                    {Number(
                      evaluation.overall_score
                    ).toFixed(0)}%

                    <span>Overall Score</span>
                  </div>
                </div>

                {/* Mock warning */}

                {evaluation.model?.includes("mock") && (
                  <p className="pp-mock-warning">
                    Test evaluation only — these scores
                    are generated by the local mock service.
                  </p>
                )}

                {/* Competency scores */}

                <h3>Competency Scores</h3>

                <div className="pp-competency-list">
                  {Object.entries(
                    evaluation.scores || {}
                  ).map(([skill, score]) => (
                    <div
                      key={skill}
                      className="pp-competency-item"
                    >
                      <div className="pp-competency-label">
                        <span>{skill}</span>

                        <strong>
                          {score === null
                            ? "Not assessed"
                            : `${score}/5`}
                        </strong>
                      </div>

                      <div className="pp-competency-track">
                        <div
                          className="pp-competency-fill"
                          style={{
                            width:
                              score === null
                                ? "0%"
                                : `${Math.min(
                                    100,
                                    Math.max(
                                      0,
                                      score * 20
                                    )
                                  )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Strengths and improvements */}

                <div className="pp-feedback-columns">

                  <div className="pp-feedback-card">
                    <h3>
                      <CheckCircle2 size={18} />
                      Strengths
                    </h3>

                    <ul>
                      {(evaluation.strengths || []).map(
                        (strength, index) => (
                          <li key={index}>
                            {strength}
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  <div className="pp-feedback-card">
                    <h3>
                      <Target size={18} />
                      Areas for Improvement
                    </h3>

                    <ul>
                      {(
                        evaluation.improvements || []
                      ).map(
                        (improvement, index) => (
                          <li key={index}>
                            {improvement}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>

                {/* Personalized feedback */}

                <div className="pp-feedback-summary">
                  <h3>
                    <BrainCircuit size={18} />
                    Personalized Feedback
                  </h3>

                  <p>{evaluation.feedback}</p>
                </div>
              </section>
            )}

            {/* Message composer */}

            <div className="pp-composer-area">

              {messageError && (
                <div
                  className="pp-message-error"
                  role="alert"
                >
                  <CircleAlert size={17} />
                  {messageError}
                </div>
              )}

              {!active && (
                <div className="pp-inactive-warning">
                  <ShieldCheck size={17} />

                  This session is no longer active.
                  You can review the conversation
                  but cannot send messages.
                </div>
              )}

              <form
                className="pp-message-composer"
                onSubmit={handleSendMessage}
              >
                <textarea
                  value={newMessage}
                  onChange={(event) =>
                    setNewMessage(event.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  placeholder={
                    active
                      ? "Type your response to the customer..."
                      : "This training session is inactive"
                  }
                  rows={3}
                  maxLength={5000}
                  disabled={
                    sending ||
                    evaluating ||
                    loadingMessages ||
                    !active
                  }
                  aria-label="Your message to the customer"
                />

                <div className="pp-composer-bottom">
                  <span className="pp-composer-hint">
                    Enter to send · Shift + Enter for a new line
                  </span>

                  <div className="pp-composer-actions">
                    <span>
                      {newMessage.length}/5000
                    </span>

                    <button
                      type="submit"
                      className="pp-send-button"
                      disabled={
                        sending ||
                        evaluating ||
                        loadingMessages ||
                        !newMessage.trim() ||
                        !active
                      }
                      aria-label="Send message"
                    >
                      {sending ? (
                        <LoaderCircle
                          className="pp-spin"
                          size={19}
                        />
                      ) : (
                        <Send size={19} />
                      )}
                    </button>
                  </div>
                </div>
              </form>

              <p className="pp-composer-caption">
                <ShieldCheck size={13} />
                Practice environment · Messages saved
                to your session
              </p>
            </div>
          </section>

          {/* Scenario briefing sidebar */}

          {sidebarOpen && (
            <aside className="pp-training-sidebar">

              <div className="pp-sidebar-header">
                <div>
                  <span className="pp-section-eyebrow">
                    YOUR TRAINING GUIDE
                  </span>

                  <h2>Scenario briefing</h2>
                </div>

                <button
                  type="button"
                  className="pp-sidebar-toggle"
                  onClick={() =>
                    setSidebarOpen(false)
                  }
                  aria-label="Close scenario briefing"
                >
                  <PanelRightClose size={19} />
                </button>
              </div>

              <div className="pp-sidebar-content">

                {/* Customer persona */}

                <div className="pp-persona-card">
                  <div className="pp-persona-avatar">
                    <UserRound size={36} />
                  </div>

                  <span className="pp-persona-label">
                    SIMULATED CUSTOMER
                  </span>

                  <h3>Customer persona</h3>

                  <p>
                    {session.customer_persona ||
                      "No customer persona provided."}
                  </p>
                </div>

                {/* Situation */}

                <div className="pp-briefing-item">
                  <div className="pp-briefing-icon cyan">
                    <MessageCircle size={19} />
                  </div>

                  <div>
                    <span>THE SITUATION</span>

                    <p>
                      {session.situation ||
                        "Not provided."}
                    </p>
                  </div>
                </div>

                {/* Objective */}

                <div className="pp-briefing-item">
                  <div className="pp-briefing-icon violet">
                    <Target size={19} />
                  </div>

                  <div>
                    <span>YOUR OBJECTIVE</span>

                    <p>
                      {session.objective ||
                        "Not provided."}
                    </p>
                  </div>
                </div>

                {/* Difficulty */}

                <div className="pp-briefing-item">
                  <div className="pp-briefing-icon pink">
                    <BrainCircuit size={19} />
                  </div>

                  <div>
                    <span>DIFFICULTY</span>

                    <p>
                      {formatLabel(session.difficulty)}
                    </p>
                  </div>
                </div>

                {/* Conversation tips */}

                <div className="pp-tips-card">
                  <button
                    type="button"
                    className="pp-tips-toggle"
                    onClick={() =>
                      setTipsOpen((open) => !open)
                    }
                    aria-expanded={tipsOpen}
                  >
                    <span>
                      <Sparkles size={17} />
                      Conversation tips
                    </span>

                    <ChevronDown
                      size={17}
                      className={
                        tipsOpen ? "open" : ""
                      }
                    />
                  </button>

                  {tipsOpen && (
                    <div className="pp-tips-content">
                      <p>
                        <CheckCircle2 size={15} />
                        Introduce yourself professionally.
                      </p>

                      <p>
                        <CheckCircle2 size={15} />
                        Ask open-ended questions.
                      </p>

                      <p>
                        <CheckCircle2 size={15} />
                        Address concerns clearly.
                      </p>

                      <p>
                        <CheckCircle2 size={15} />
                        Focus on customer needs.
                      </p>
                    </div>
                  )}
                </div>

                {/* Sidebar footer */}

                <div className="pp-sidebar-footer">
                  <ShieldCheck size={15} />
                  Private practice workspace
                </div>
              </div>
            </aside>
          )}
        </main>
      )}
    </div>
  );
}
