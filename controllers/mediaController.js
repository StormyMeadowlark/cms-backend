// controllers/mediaController.js
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
const Media = require("../models/Media");
require("dotenv").config();

// Configure AWS SDK for DigitalOcean Spaces
const s3Client = new S3Client({
  endpoint: `https://${process.env.SPACES_ENDPOINT}`,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.SPACES_KEY,
    secretAccessKey: process.env.SPACES_SECRET,
  },
  forcePathStyle: false,
});

// Upload a media file
exports.uploadMedia = async (req, res) => {
  try {
    console.log("Upload request received."); // Log when upload request is received
    console.log("Request headers:", req.headers); // Log request headers
    console.log("Request file:", req.file); // Log request file details
    console.log("Request body:", req.body); // Log request body

    const file = req.file;
    if (!file) {
      console.warn("No file provided in the request."); // Log warning if no file is provided
      return res.status(400).json({ error: "No file provided" });
    }

    const filename = `${uuidv4()}.${file.originalname.split(".").pop()}`;
    console.log("Generated filename:", filename); // Log generated filename

    const params = {
      Bucket: process.env.SPACES_BUCKET,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
    };

    console.log("Uploading file to DigitalOcean Spaces..."); // Log upload start
    await s3Client.send(new PutObjectCommand(params));

    const media = new Media({
      filename: filename,
      url: `https://${params.Bucket}.${process.env.SPACES_ENDPOINT}/${filename}`,
      type: file.mimetype,
    });

    console.log("Saving file information to database..."); // Log save to database
    await media.save();
    console.log("File uploaded and saved successfully."); // Log success
    res.status(201).json(media);
  } catch (error) {
    console.error("Error uploading media:", error.message); // Log error message
    res.status(500).json({ error: "Error uploading media" });
  }
};

// List all media files
exports.getAllMedia = async (req, res) => {
  try {
    console.log("Fetching all media files..."); // Log fetch request
    const mediaFiles = await Media.find().sort({ createdAt: -1 });
    res.status(200).json(mediaFiles);
  } catch (error) {
    console.error("Error fetching media files:", error.message); // Log error message
    res.status(500).json({ error: "Error fetching media files" });
  }
};

// Get a specific media file by ID
exports.getMediaById = async (req, res) => {
  try {
    console.log(`Fetching media file with ID: ${req.params.id}`); // Log specific media fetch request
    const media = await Media.findById(req.params.id);
    if (!media) {
      console.warn("Media file not found."); // Log if media file is not found
      return res.status(404).json({ error: "Media file not found" });
    }
    res.status(200).json(media);
  } catch (error) {
    console.error("Error fetching media file:", error.message); // Log error message
    res.status(500).json({ error: "Error fetching media file" });
  }
};

// Delete a media file
exports.deleteMedia = async (req, res) => {
  try {
    console.log(`Deleting media file with ID: ${req.params.id}`); // Log deletion request
    const media = await Media.findById(req.params.id);
    if (!media) {
      console.warn("Media file not found for deletion."); // Log if media file is not found
      return res.status(404).json({ error: "Media file not found" });
    }

    // Delete from DigitalOcean Spaces
    const deleteParams = {
      Bucket: process.env.SPACES_BUCKET,
      Key: media.filename,
    };
    console.log("Deleting file from DigitalOcean Spaces..."); // Log start of deletion from Spaces
    await s3Client.send(new DeleteObjectCommand(deleteParams));

    // Delete from the database
    await media.deleteOne();
    console.log("Media file deleted successfully."); // Log success
    res.status(200).json({ message: "Media file deleted successfully" });
  } catch (error) {
    console.error("Error deleting media file:", error.message); // Log error message
    res.status(500).json({ error: "Error deleting media file" });
  }
};
