
const generateCustomerResponse = async (messages) => {
  const apiUrl = process.env.LLM_API_URL;
  const apiKey = process.env.LLM_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error("LLM inference service is not configured");
  }

  if (!Array.isArray(messages) || messages.length < 2) {
    throw new Error("Invalid conversation messages");
  }

  // Extract the customer persona from the system message
  const systemMessage = messages.find(
    (message) => message.role === "system"
  );

  const persona = systemMessage?.content;

  if (typeof persona !== "string" || !persona.trim()) {
    throw new Error("Customer persona is missing");
  }

  // The most recent message should come from the salesperson
  const lastMessage = messages[messages.length - 1];

  if (
    lastMessage.role !== "user" ||
    typeof lastMessage.content !== "string" ||
    !lastMessage.content.trim()
  ) {
    throw new Error("Latest salesperson message is invalid");
  }

  // Preserve previous conversation turns
  const history = messages
    .slice(0, -1)
    .filter(
      (message) =>
        message.role === "user" ||
        message.role === "assistant"
    )
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));

  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    120000
  );

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({
        persona,
        message: lastMessage.content,
        history,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "PitchPilot inference error:",
        response.status,
        errorText.slice(0, 300)
      );

      throw new Error("PitchPilot inference request failed");
    }

    const data = await response.json();

    const content = data.customer_response;

    if (typeof content !== "string" || !content.trim()) {
      throw new Error("PitchPilot returned an empty response");
    }

    return content.trim();

  } finally {
    clearTimeout(timeout);
  }
};

module.exports = {
  generateCustomerResponse,
};
