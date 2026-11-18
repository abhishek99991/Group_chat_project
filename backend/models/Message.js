
const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["text", "image", "video", "file"],
      default: "text",
    },

    message: {
      type: String,
      trim: true,
      required: function () {
        return this.type === "text";
      },
    },

    media: {
      type: mediaSchema,
      required: function () {
        return this.type !== "text";
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);
