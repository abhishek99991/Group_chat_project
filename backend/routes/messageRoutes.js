
const express = require("express");
const router = express.Router();

const {
  sendMessage,
  getMessages,
} = require("../controllers/messageController");

const authMiddleware = require("../middleware/authMiddleware");

// API to send message
router.post("/", authMiddleware, sendMessage);

// API to get all messages
router.get("/", authMiddleware, getMessages);

module.exports = router;
