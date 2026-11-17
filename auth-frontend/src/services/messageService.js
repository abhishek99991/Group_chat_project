
import axios from "axios";

const API_URL = "http://localhost:5000/api/messages";

// Get JWT token
const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login first. Token not found.");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// Send message API
export const sendMessage = async (message) => {
  const response = await axios.post(
    API_URL,
    { message },
    getAuthConfig()
  );

  return response.data;
};

// Get all messages API
export const getMessages = async () => {
  const response = await axios.get(
    API_URL,
    getAuthConfig()
  );

  return response.data;
};
