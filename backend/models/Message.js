
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      default: "",
      trim: true,
    },

    messageType: {
      type: String,
      enum: ["text", "image", "video", "file"],
      default: "text",
    },

    media: {
      fileName: {
        type: String,
        default: null,
      },
      fileKey: {
        type: String,
        default: null,
      },
      fileUrl: {
        type: String,
        default: null,
      },
      fileType: {
        type: String,
        default: null,
      },
      fileSize: {
        type: Number,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);
