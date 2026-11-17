
const Message = require("../models/Message");

// POST: Save a new message
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    const newMessage = await Message.create({
      sender: req.user.userId,
      message: message.trim(),
    });

    const savedMessage = await newMessage.populate(
      "sender",
      "name email"
    );

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

// GET: Fetch all messages from database
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
    console.error("Fetch messages error:", error);

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
