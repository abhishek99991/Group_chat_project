
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Message = require("./models/Message");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Existing APIs
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Authenticate WebSocket connections using JWT
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication token required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.userId = decoded.userId;

    next();
  } catch (error) {
    next(new Error("Invalid or expired token"));
  }
});

// Handle connections


io.on("connection", (socket) => {
  console.log("User connected:", socket.userId);

  socket.on("sendMessage", async (data, callback) => {
    try {
      console.log("Message received:", data);

      if (!data.message || !data.message.trim()) {
        return callback({
          success: false,
          message: "Message cannot be empty",
        });
      }

      // Save message in MongoDB
      const newMessage = await Message.create({
        sender: socket.userId,
        message: data.message.trim(),
      });

      // Populate sender details
      const savedMessage = await newMessage.populate(
        "sender",
        "name email"
      );

      // Broadcast to all connected users
      io.emit("newMessage", savedMessage);

      console.log("Message broadcast successfully");

      // Send acknowledgement to frontend
      callback({
        success: true,
        data: savedMessage,
      });

    } catch (error) {
      console.error("Socket message error:", error);

      callback({
        success: false,
        message: "Failed to save message",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId);
  });
});



// Make Socket.IO available inside controllers
app.set("io", io);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Server error:", error.message);
  }
};

startServer();
