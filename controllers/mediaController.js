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
  endpoint: `https://${process.env.SPACES_ENDPOINT}`, // Your Spaces endpoint, e.g., nyc3.digitaloceanspaces.com
  region: "us-east-1", // Required, but doesn't affect Spaces
  credentials: {
    accessKeyId: process.env.SPACES_KEY,
    secretAccessKey: process.env.SPACES_SECRET,
  },
  forcePathStyle: false, // Optional, can be true or false depending on your needs
});

// Upload a media file
// Controller: uploadMedia function
exports.uploadMedia = async (req, res) => {
  try {
    const file = req.file;
    const filename = `${uuidv4()}.${file.originalname.split(".").pop()}`; // Use 'filename' instead of 'key'

    const params = {
      Bucket: process.env.SPACES_BUCKET,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
    };

    const command = new PutObjectCommand(params);
    const data = await s3Client.send(command);

    const media = new Media({
      filename: filename, // Save as 'filename'
      url: `https://${params.Bucket}.${process.env.SPACES_ENDPOINT}/${filename}`,
      type: file.mimetype,
      uploadDate: Date.now(),
    });

    await media.save();
    res.status(201).json(media);
  } catch (error) {
    console.error("Error uploading media:", error);
    res.status(500).json({ error: "Error uploading media" });
  }
};


// List all media files
exports.getAllMedia = async (req, res) => {
  try {
    const mediaFiles = await Media.find().sort({ uploadDate: -1 });
    res.status(200).json(mediaFiles);
  } catch (error) {
    console.error("Error fetching media files:", error);
    res.status(500).json({ error: "Error fetching media files" });
  }
};

// Get a specific media file by ID
exports.getMediaById = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ error: "Media file not found" });
    }
    res.status(200).json(media);
  } catch (error) {
    console.error("Error fetching media file:", error);
    res.status(500).json({ error: "Error fetching media file" });
  }
};

// Delete a media file
exports.deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ error: "Media file not found" });
    }

    // Delete from DigitalOcean Spaces
    const params = {
      Bucket: process.env.SPACES_BUCKET,
      Key: media.filename,
    };
    const command = new DeleteObjectCommand(params);
    const data = await s3Client.send(command);

    // Delete from database
    await media.deleteOne(media._id)
    res.status(200).json({ message: "Media file deleted successfully" });
  } catch (error) {
    console.error("Error deleting media file:", error);
    res.status(500).json({ error: "Error deleting media file" });
  }
};
