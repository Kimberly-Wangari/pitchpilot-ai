import api from "./api";

export const getConversationMessages = async (sessionId) => {
  const response = await api.get(
    `/training-sessions/${sessionId}/messages`
  );

  return response.data;
};

export const sendConversationMessage = async (sessionId, message) => {
  const response = await api.post(
    `/training-sessions/${sessionId}/messages`,
    { message }
  );

  return response.data;
};