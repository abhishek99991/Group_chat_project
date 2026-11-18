
const User = require("../models/User");

// Find user by email
const getUserByEmail = async (req, res) => {
  try {
    const email = req.query.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email }).select(
      "_id name email"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    // Prevent users from starting a chat with themselves
    if (String(user._id) === String(req.user.userId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot chat with yourself",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User found successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Get user by email error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { getUserByEmail };
