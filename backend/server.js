
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
require("dotenv").config();
const mediaRoutes = require("./routes/mediaRoutes");
const { startArchiveJob } = require("./cron/archiveMessages");const aiRoutes = require("./routes/aiRoutes");
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");
const initSocket = require("./socket-io");
const userRoutes = require("./routes/userRoutes");
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// REST API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/ai", aiRoutes);

// Initialize Socket.IO
const io = initSocket(server);

// Make Socket.IO available in controllers
app.set("io", io);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");
startArchiveJob();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server error:", error.message);
  }
};

startServer();
