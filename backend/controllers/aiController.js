
const {
  getPredictiveSuggestions,
  getSmartReplies,
} = require("../services/geminiService");

// Predictive typing API
const predictiveSuggestions = async (req, res) => {
  try {
    const { message, tone } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a message",
      });
    }

    if (message.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 500 characters",
      });
    }

    const result = await getPredictiveSuggestions(
      message.trim(),
      tone || "casual"
    );

    return res.status(200).json({
      success: true,
      suggestions: result.suggestions,
    });
  } catch (error) {
    console.error("Predictive suggestions error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate suggestions",
    });
  }
};

// Smart replies API
const smartReplies = async (req, res) => {
  try {
    const { message, tone } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Incoming message is required",
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 1000 characters",
      });
    }

    const result = await getSmartReplies(
      message.trim(),
      tone || "casual"
    );

    return res.status(200).json({
      success: true,
      replies: result.replies,
    });
  } catch (error) {
    console.error("Smart replies error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate smart replies",
    });
  }
};

module.exports = {
  predictiveSuggestions,
  smartReplies,
};
