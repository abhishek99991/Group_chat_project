
const personalChatHandler = (io, socket) => {
  const userId = String(socket.data.userId);

  // Join a private room with another user
  socket.on("join_room", (data, callback) => {
    try {
      const recipientId = String(data?.recipientId || "");

      if (!recipientId || recipientId === userId) {
        return callback?.({
          success: false,
          message: "Invalid recipient",
        });
      }

      // Both users get the same room ID
      const roomId = [userId, recipientId].sort().join("_");

      socket.join(roomId);

      console.log(`${userId} joined personal room: ${roomId}`);

      callback?.({
        success: true,
        roomId,
        message: "Joined personal chat successfully",
      });
    } catch (error) {
      console.error("Join room error:", error);

      callback?.({
        success: false,
        message: "Unable to join room",
      });
    }
  });

  // Send a personal message
  socket.on("new_message", (data, callback) => {
    try {
      const recipientId = String(data?.recipientId || "");
      const message = data?.message;

      if (!recipientId || recipientId === userId) {
        return callback?.({
          success: false,
          message: "Invalid recipient",
        });
      }

      if (typeof message !== "string" || !message.trim()) {
        return callback?.({
          success: false,
          message: "Message cannot be empty",
        });
      }

      const roomId = [userId, recipientId].sort().join("_");

      // Make sure the sender has joined this room
      if (!socket.rooms.has(roomId)) {
        return callback?.({
          success: false,
          message: "Please join the personal chat first",
        });
      }

      const messageData = {
        senderId: userId,
        recipientId,
        message: message.trim(),
        createdAt: new Date(),
      };

      // Send only to users in this private room
      io.to(roomId).emit("personal_message", messageData);

      callback?.({
        success: true,
        message: "Personal message sent",
      });
    } catch (error) {
      console.error("Personal message error:", error);

      callback?.({
        success: false,
        message: "Failed to send personal message",
      });
    }
  });
};

module.exports = personalChatHandler;
