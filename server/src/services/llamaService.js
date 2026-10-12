
const generateCustomerResponse = async (messages) => {
  const apiUrl = process.env.LLM_API_URL;
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL;

  if (!apiUrl || !apiKey || !model) {
    throw new Error("LLM inference service is not configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 250,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "LLM inference error:",
        response.status,
        errorText.slice(0, 300)
      );

      throw new Error("LLM inference request failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (typeof content !== "string" || !content.trim()) {
      throw new Error("LLM returned an empty response");
    }

    return content.trim();
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = {
  generateCustomerResponse,
};
