
const jwt = require("jsonwebtoken");

const socketAuth = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication token required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Save the authenticated user's ID
    socket.data.userId = decoded.userId;

    console.log("Socket authenticated:", socket.data.userId);

    next();
  } catch (error) {
    console.error("Socket authentication failed:", error.message);
    next(new Error("Invalid or expired token"));
  }
};

module.exports = socketAuth;
