
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { getUserByEmail } = require("../controllers/userController");

// Search user by email
router.get("/by-email", authMiddleware, getUserByEmail);

module.exports = router;
