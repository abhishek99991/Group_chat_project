
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  predictiveSuggestions,
  smartReplies,
} = require("../controllers/aiController");

// Predictive typing
router.post(
  "/suggestions",
  authMiddleware,
  predictiveSuggestions
);

// Smart replies
router.post(
  "/smart-replies",
  authMiddleware,
  smartReplies
);

module.exports = router;
