const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const Media = require("../models/Media");
const config = require("../config/config");

// Configure AWS SDK for DigitalOcean Spaces
const spacesEndpoint = new AWS.Endpoint(config.aws.endpoint);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
});

// Upload a media file
exports.uploadMedia = async (req, res) => {
  try {
    const file = req.file; // Assuming you're using a middleware like multer
    const key = `${uuidv4()}.${file.originalname.split(".").pop()}`;

    const params = {
      Bucket: config.aws.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read", // Make the file publicly accessible
    };

    const data = await s3.upload(params).promise();

    const media = new Media({
      url: data.Location,
      key: data.Key,
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
      Bucket: config.aws.bucketName,
      Key: media.key,
    };
    await s3.deleteObject(params).promise();

    // Delete from database
    await media.remove();
    res.status(200).json({ message: "Media file deleted successfully" });
  } catch (error) {
    console.error("Error deleting media file:", error);
    res.status(500).json({ error: "Error deleting media file" });
  }
};
