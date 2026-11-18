
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const crypto = require("crypto");
const path = require("path");

const s3 = require("../config/s3");

const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a file",
      });
    }

    const fileExtension = path.extname(req.file.originalname);
    const uniqueFileName = `${crypto.randomUUID()}${fileExtension}`;

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `chat-media/${uniqueFileName}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    await s3.send(new PutObjectCommand(uploadParams));

    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/chat-media/${uniqueFileName}`;

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      file: {
        fileName: req.file.originalname,
        fileUrl,
        fileType: req.file.mimetype,
      },
    });
  } catch (error) {
    console.error("Media upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload file",
    });
  }
};

module.exports = { uploadMedia };
