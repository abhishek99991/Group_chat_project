
const personalChatHandler = (io, socket) => {
  const userId = String(socket.data.userId);

  // Join personal room
  socket.on("join_room", (data, callback) => {
    try {
      const recipientId = String(data?.recipientId || "");

      if (!recipientId || recipientId === userId) {
        return callback?.({
          success: false,
          message: "Invalid recipient",
        });
      }

      const roomId = [userId, recipientId].sort().join("_");

      socket.join(roomId);

      console.log("User joined room:", roomId);

      callback?.({
        success: true,
        roomId,
        message: "Joined room successfully",
      });
    } catch (error) {
      console.error("Join room error:", error);

      callback?.({
        success: false,
        message: "Unable to join room",
      });
    }
  });

  // Send personal message
  socket.on("new_message", (data, callback) => {
    console.log("New personal message event received:", data);

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

      if (!socket.rooms.has(roomId)) {
        return callback?.({
          success: false,
          message: "Please join the personal room first",
        });
      }

      const messageData = {
        senderId: userId,
        recipientId,
        message: message.trim(),
        createdAt: new Date(),
      };

      io.to(roomId).emit("personal_message", messageData);

      console.log("Personal message sent to room:", roomId);

      // Important: respond to frontend
      if (typeof callback === "function") {
        callback({
          success: true,
          message: "Personal message sent successfully",
          data: messageData,
        });
      }
    } catch (error) {
      console.error("Personal message error:", error);

      if (typeof callback === "function") {
        callback({
          success: false,
          message: "Failed to send personal message",
        });
      }
    }
  });
};

module.exports = personalChatHandler;
