
// frontend/src/services/simulationService.js

export async function generateCustomerResponse(
  persona,
  messages,
  accessToken
) {
  const response = await fetch(
    "/api/simulation/customer-response",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        persona,
        messages
      })
    }
  );

  if (!response.ok) {
    throw new Error(
      "Unable to generate customer response"
    );
  }

  return await response.json();
}
