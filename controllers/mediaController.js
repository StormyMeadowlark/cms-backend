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
    const file = req.file;
    const filename = `${uuidv4()}.${file.originalname.split(".").pop()}`;

    const params = {
      Bucket: process.env.SPACES_BUCKET,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    const media = new Media({
      filename: filename,
      url: `https://${params.Bucket}.${process.env.SPACES_ENDPOINT}/${filename}`,
      type: file.mimetype,
      uploadDate: Date.now(),
      user: req.user._id, // Associate the media with the user
      tenant: req.tenantId, // Associate the media with the tenant
    });

    await media.save();
    res.status(201).json({ url: media.url });
  } catch (error) {
    console.error("Error uploading media:", error);
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

exports.getMediaByTenant = async (req, res) => {
  try {
    const tenantId = req.tenantId; // Get tenant ID from the request

    const mediaFiles = await Media.find({ tenant: tenantId }).sort({
      uploadDate: -1,
    });

    res.status(200).json(mediaFiles);
  } catch (error) {
    console.error("Error fetching media by tenant:", error);
    res.status(500).json({ error: "Error fetching media by tenant" });
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
