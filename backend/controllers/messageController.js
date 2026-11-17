
const Message = require("../models/Message");

// Send message
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    // Save message in MongoDB
    const newMessage = await Message.create({
      sender: req.user.userId,
      message: message.trim(),
    });

    // Get sender details
    const savedMessage = await newMessage.populate(
      "sender",
      "name email"
    );

    // Broadcast message to all connected users
    const io = req.app.get("io");
    io.emit("newMessage", savedMessage);

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: savedMessage,
    });

  } catch (error) {
    console.error("Send message error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

// Get all messages
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      totalMessages: messages.length,
      data: messages,
    });

  } catch (error) {
    console.error("Get messages error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};

module.exports = {
  sendMessage,
  getMessages,
};
