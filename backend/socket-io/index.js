
const { Server } = require("socket.io");

const socketAuth = require("./middleware");
const chatHandler = require("./handlers/chat");

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  // Authenticate users before allowing connections
  io.use(socketAuth);

  io.on("connection", (socket) => {
    const userId = socket.data.userId;

    console.log("User connected:", userId);

    // Register chat events
    chatHandler(io, socket);

    socket.on("disconnect", () => {
      console.log("User disconnected:", userId);
    });
  });

  return io;
};

module.exports = initSocket;
