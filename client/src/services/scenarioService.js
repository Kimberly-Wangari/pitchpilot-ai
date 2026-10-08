import api from "./api";

export const getScenarios = async () => {
  const response = await api.get("/scenarios");
  return response.data;
};

export const getScenarioById = async (id) => {
  const response = await api.get(`/scenarios/${id}`);
  return response.data;
};