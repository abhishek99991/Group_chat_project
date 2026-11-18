
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const { uploadMedia } = require("../controllers/mediaController");

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  uploadMedia
);

module.exports = router;
