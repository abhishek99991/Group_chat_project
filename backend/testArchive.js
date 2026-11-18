
require("dotenv").config();

const mongoose = require("mongoose");
const Message = require("./models/Message");
const User = require("./models/User");
const ArchivedChat = require("./models/ArchivedChat");
const { archiveOldMessages } = require("./cron/archiveMessages");

const testArchive = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // Find an existing user
    const user = await User.findOne();

    if (!user) {
      throw new Error("No user found. Please register a user first.");
    }

    // Create a message with a date older than 24 hours
    const oldDate = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const testMessage = await Message.create({
      sender: user._id,
      message: "Test archived message",
      messageType: "text",
      createdAt: oldDate,
      updatedAt: oldDate,
    });

    console.log("Test message created:", testMessage._id);

    // Run archive manually
    await archiveOldMessages();

    // Check whether message exists in archive
    const archivedMessage = await ArchivedChat.findById(testMessage._id);

    // Check whether message still exists in active collection
    const activeMessage = await Message.findById(testMessage._id);

    console.log("Archived message found:", !!archivedMessage);
    console.log("Active message found:", !!activeMessage);

  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await mongoose.disconnect();
  }
};

testArchive();
