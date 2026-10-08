import api from "./api";

export const createTrainingSession = async (scenarioId) => {
  const response = await api.post("/training-sessions", {
    scenarioId,
  });

  return response.data;
};

export const getTrainingSessionById = async (sessionId) => {
  const response = await api.get(
    `/training-sessions/${sessionId}`
  );

  return response.data;
};