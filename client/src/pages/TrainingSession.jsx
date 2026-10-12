
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getTrainingSessionById } from "../services/trainingSessionService";

import {
  getConversationMessages,
  sendConversationMessage,
} from "../services/conversationService";

function TrainingSession() {
  const { sessionId } = useParams();

  // Training session state
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Conversation state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [messageError, setMessageError] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(true);

  // Load training session details
  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      try {
        setLoading(true);
        setError("");
        setSession(null);

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

  // Retrieve saved conversation messages
  useEffect(() => {
    let active = true;

    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        setMessageError("");
        setMessages([]);

        const data = await getConversationMessages(sessionId);

        if (active) {
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error("Unable to load messages:", err);

        if (active) {
          setMessageError(
            err.response?.data?.message ||
              "Unable to load conversation history."
          );
        }
      } finally {
        if (active) {
          setLoadingMessages(false);
        }
      }
    };

    loadMessages();

    return () => {
      active = false;
    };
  }, [sessionId]);

  // Send a message from the sales agent
  const handleSendMessage = async (event) => {
    event.preventDefault();

    const messageText = newMessage.trim();

    if (
      !messageText ||
      sending ||
      loadingMessages ||
      session?.status !== "in_progress"
    ) {
      return;
    }

    try {
      setSending(true);
      setMessageError("");

      const data = await sendConversationMessage(
        sessionId,
        messageText
      );

      setMessages((previous) => [
        ...previous,
        data.conversationMessage,
      ]);

      setNewMessage("");
    } catch (err) {
      console.error("Unable to send message:", err);

      setMessageError(
        err.response?.data?.message ||
          "Unable to send message. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="training-page">
        <p>Loading training session...</p>
      </main>
    );
  }

  // Error state
  if (error || !session) {
    return (
      <main className="training-page">
        <h2>Training session unavailable</h2>

        <p>{error || "Training session not found."}</p>

        <Link to="/scenarios" className="secondary-button">
          Back to Scenarios
        </Link>
      </main>
    );
  }

  return (
    <main className="training-page">
      <div className="training-container">

        {/* Training session header */}
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

        {/* Scenario details */}
        <section className="scenario-details-card">
          <h2>Customer Persona</h2>
          <p>{session.customer_persona}</p>

          <h2>Situation</h2>
          <p>{session.situation}</p>

          <h2>Training Objective</h2>
          <p>{session.objective}</p>
        </section>

        {/* Conversation interface */}
        <section className="conversation-panel">

          <div className="conversation-messages">
            {loadingMessages ? (
              <div className="conversation-empty">
                <p>Loading conversation history...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="conversation-empty">
                <h2>Ready to begin?</h2>

                <p>
                  Send your first message to start
                  the sales conversation.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`chat-message ${message.sender}`}
                >
                  <strong>
                    {message.sender === "agent"
                      ? "You"
                      : message.sender === "customer"
                        ? "Customer"
                        : "System"}
                  </strong>

                  <p>{message.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Conversation error */}
          {messageError && (
            <p
              role="alert"
              className="scenario-error"
            >
              {messageError}
            </p>
          )}

          {/* Message input */}
          <form
            className="message-input-area"
            onSubmit={handleSendMessage}
          >
            <input
              type="text"
              value={newMessage}
              onChange={(event) =>
                setNewMessage(event.target.value)
              }
              placeholder="Type your response..."
              maxLength={5000}
              disabled={
                sending ||
                loadingMessages ||
                session.status !== "in_progress"
              }
            />

            <button
              type="submit"
              className="primary-button"
              disabled={
                sending ||
                loadingMessages ||
                !newMessage.trim() ||
                session.status !== "in_progress"
              }
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </form>

          {session.status !== "in_progress" && (
            <p className="scenario-error">
              This training session is no longer active.
            </p>
          )}

        </section>
      </div>
    </main>
  );
}

export default TrainingSession;
