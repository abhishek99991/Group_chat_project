
const { CronJob } = require("cron");

const Message = require("../models/Message");
const ArchivedChat = require("../models/ArchivedChat");

const archiveOldMessages = async () => {
  try {
    console.log("Starting message archive job...");

    // Find messages older than 24 hours
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const BATCH_SIZE = 500;
    let totalArchived = 0;

    while (true) {
      // Fetch a maximum of 500 old messages
      const oldMessages = await Message.find({
        createdAt: { $lt: cutoffDate },
      })
        .sort({ createdAt: 1 })
        .limit(BATCH_SIZE)
        .lean();

      if (oldMessages.length === 0) {
        break;
      }

      // First copy messages into ArchivedChat
      await ArchivedChat.bulkWrite(
        oldMessages.map((chat) => ({
          replaceOne: {
            filter: { _id: chat._id },
            replacement: chat,
            upsert: true,
          },
        }))
      );

      // Delete from active collection only after archive succeeds
      const messageIds = oldMessages.map((chat) => chat._id);

      const deleteResult = await Message.deleteMany({
        _id: { $in: messageIds },
      });

      totalArchived += deleteResult.deletedCount;
    }

    console.log(
      `Archive job completed. Messages archived: ${totalArchived}`
    );
  } catch (error) {
    console.error("Archive job failed:", error);
  }
};

// Run every night at 12:00 AM (India time)
const archiveJob = new CronJob(
  "0 0 * * *",
  archiveOldMessages,
  null,
  false,
  "Asia/Kolkata"
);

const startArchiveJob = () => {
  archiveJob.start();
  console.log("Message archive cron job started");
};

module.exports = {
  startArchiveJob,
  archiveOldMessages,
};
