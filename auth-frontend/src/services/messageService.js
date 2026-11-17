
import axios from "axios";

const API_URL = "http://localhost:5000/api/messages";

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

// Send message
export const sendMessage = async (message) => {
  const response = await axios.post(
    API_URL,
    { message },
    getAuthConfig()
  );

  return response.data;
};

// Fetch messages
export const getMessages = async () => {
  const response = await axios.get(
    API_URL,
    getAuthConfig()
  );

  return response.data;
};
