
import api from "./api";

// Start training session
export const createTrainingSession = async (scenarioId) => {
  const response = await api.post(
    "/training-sessions",
    { scenarioId }
  );

  return response.data;
};

// Retrieve a specific session
export const getTrainingSessionById = async (sessionId) => {
  const response = await api.get(
    `/training-sessions/${sessionId}`
  );

  return response.data;
};

// Complete and evaluate a training session
export const endAndEvaluateTrainingSession = async (
  sessionId
) => {
  const response = await api.post(
    `/training-sessions/${sessionId}/end-and-evaluate`
  );

  return response.data;
};

// Retrieve a saved performance report
export const getTrainingSessionEvaluation = async (
  sessionId
) => {
  const response = await api.get(
    `/training-sessions/${sessionId}/evaluation`
  );

  return response.data;
};

// NEW: Retrieve the logged-in Agent's progress
export const getMyTrainingProgress = async () => {
  const response = await api.get(
    "/training-sessions/my-progress"
  );

  return response.data;
};
