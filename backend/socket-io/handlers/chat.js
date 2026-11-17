
const Message = require("../../models/Message");

const chatHandler = (io, socket) => {
  const userId = socket.data.userId;

  socket.on("sendMessage", async (data, callback) => {
    try {
      if (
        typeof data?.message !== "string" ||
        !data.message.trim()
      ) {
        return callback?.({
          success: false,
          message: "Message cannot be empty",
        });
      }

      // Use the authenticated user ID, not an ID from the client
      const newMessage = await Message.create({
        sender: userId,
        message: data.message.trim(),
      });

      const savedMessage = await newMessage.populate(
        "sender",
        "name email"
      );

      // Send the message to all connected users
      io.emit("newMessage", savedMessage);

      callback?.({
        success: true,
        message: "Message sent successfully",
        data: savedMessage,
      });
    } catch (error) {
      console.error("Send message error:", error);

      callback?.({
        success: false,
        message: "Failed to send message",
      });
    }
  });
};

module.exports = chatHandler;
