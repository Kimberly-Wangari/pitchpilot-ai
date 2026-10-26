
const express = require("express");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const app = express();

app.use(express.json({ limit: "100kb" }));

const PORT = 8001;
const API_KEY = process.env.PITCHPILOT_INFERENCE_API_KEY;

if (!API_KEY) {
  console.error(
    "Missing PITCHPILOT_INFERENCE_API_KEY"
  );
  process.exit(1);
}

const SKILLS = {
  "Handling a Price Objection": [
    "Communication Clarity",
    "Objection Handling",
    "Value Communication",
  ],
  "Competitor Comparison": [
    "Needs Discovery",
    "Persuasive Communication",
    "Competitive Positioning",
  ],
  "Discovering Customer Needs": [
    "Active Listening",
    "Questioning",
    "Customer Engagement",
  ],
  "Handling a Hesitant Decision Maker": [
    "Objection Handling",
    "Customer Engagement",
    "Closing Skills",
    "Persuasive Communication",
  ],
};

function requireKey(req, res, next) {
  if (req.get("X-API-Key") !== API_KEY) {
    return res.status(401).json({
      detail: "Invalid API key",
    });
  }

  next();
}

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    model: "pitchpilot-mock-inference",
  });
});

// Simulated customer response
app.post("/chat", requireKey, (req, res) => {
  const {
    persona,
    message,
    history = [],
  } = req.body || {};

  if (
    typeof persona !== "string" ||
    typeof message !== "string" ||
    !message.trim() ||
    !Array.isArray(history)
  ) {
    return res.status(400).json({
      detail: "Invalid chat request",
    });
  }

  return res.json({
    customer_response:
      "That sounds interesting, but I'm concerned " +
      "about the cost. Can you explain why I should " +
      "choose your product over other options?",
    model: "pitchpilot-mock-inference",
  });
});

// Mock performance evaluation
app.post("/evaluate", requireKey, (req, res) => {
  const { scenario, messages } = req.body || {};

  if (
    !Object.prototype.hasOwnProperty.call(
      SKILLS,
      scenario
    ) ||
    !Array.isArray(messages) ||
    !messages.some(
      (message) => message.sender === "agent"
    )
  ) {
    return res.status(422).json({
      detail: "Invalid evaluation request",
    });
  }

  // Fixed scores for integration testing only
  const scores = Object.fromEntries(
    SKILLS[scenario].map((skill) => [skill, 3])
  );

  return res.json({
    scores,

    strengths: [
      "MOCK: Example strength for integration testing.",
    ],

    improvements: [
      "MOCK: Example improvement for integration testing.",
    ],

    feedback:
      "MOCK EVALUATION ONLY. Replace with your " +
      "actual Llama evaluator before research testing.",

    model: "pitchpilot-mock-inference",
    scenario,
    evaluated_message_count: Math.min(
      messages.length,
      15
    ),
  });
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(
    `Mock inference API running at http://127.0.0.1:${PORT}`
  );
});
