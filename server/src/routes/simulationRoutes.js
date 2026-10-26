
const express = require("express");
const router = express.Router();

const INFERENCE_URL = process.env.LLM_API_URL;
const INFERENCE_API_KEY = process.env.LLM_API_KEY;

router.post("/customer-response", async (req, res) => {
  try {
    const { persona, messages } = req.body || {};

    if (
      typeof persona !== "string" ||
      !persona.trim() ||
      persona.length > 3000 ||
      !Array.isArray(messages) ||
      messages.length === 0 ||
      messages.length > 21
    ) {
      return res.status(400).json({
        error: "Invalid persona or conversation messages"
      });
    }

    // Convert database sender names into Llama roles
    const formattedMessages = messages.map((item) => ({
      role:
        item.role === "agent" || item.sender === "agent"
          ? "user"
          : item.role === "customer" || item.sender === "customer"
          ? "assistant"
          : item.role,
      content: item.content
    }));

    if (
      formattedMessages.some(
        (item) =>
          !["user", "assistant"].includes(item.role) ||
          typeof item.content !== "string" ||
          !item.content.trim() ||
          item.content.length > 4000
      )
    ) {
      return res.status(400).json({
        error: "Invalid conversation message format"
      });
    }

    const latestMessage =
      formattedMessages[formattedMessages.length - 1];

    if (latestMessage.role !== "user") {
      return res.status(400).json({
        error: "The latest message must be from the sales agent"
      });
    }

    if (!INFERENCE_URL || !INFERENCE_API_KEY) {
      console.error("Inference service is not configured");

      return res.status(503).json({
        error: "Customer simulation service unavailable"
      });
    }

    const history = formattedMessages.slice(0, -1);

    const response = await fetch(INFERENCE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": INFERENCE_API_KEY
      },
      body: JSON.stringify({
        persona: persona.trim(),
        message: latestMessage.content,
        history
      }),
      signal: AbortSignal.timeout(120000)
    });

    if (!response.ok) {
      console.error(
        "Inference service returned:",
        response.status
      );

      return res.status(502).json({
        error: "Customer simulation service unavailable"
      });
    }

    const result = await response.json();

    if (
      typeof result.customer_response !== "string" ||
      !result.customer_response.trim()
    ) {
      return res.status(502).json({
        error: "Invalid response from inference service"
      });
    }

    return res.status(200).json({
      customer_response: result.customer_response.trim(),
      model: result.model
    });

  } catch (error) {
    console.error(
      "Simulation request failed:",
      error.message
    );

    return res.status(503).json({
      error: "Unable to generate customer response"
    });
  }
});

module.exports = router;
