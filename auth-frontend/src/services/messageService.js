
import axios from "axios";

const API_URL = "http://localhost:3000/api/messages";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login first");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const sendMessage = async (message) => {
  const response = await axios.post(
    API_URL,
    { message },
    getAuthConfig()
  );

  return response.data;
};

export const getMessages = async () => {
  const response = await axios.get(
    API_URL,
    getAuthConfig()
  );

  return response.data;
};
