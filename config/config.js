const AWS = require("aws-sdk");

// Configure AWS SDK for DigitalOcean Spaces
const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET,
});

// Example function to upload a file to DigitalOcean Spaces
const uploadFile = async (file) => {
  const params = {
    Bucket: process.env.DO_SPACES_BUCKET,
    Key: `uploads/${file.originalname}`, // Example file path
    Body: file.buffer,
    ACL: "public-read", // Make the file publicly accessible
  };

  try {
    const data = await s3.upload(params).promise();
    console.log(`File uploaded successfully. ${data.Location}`);
    return data.Location;
  } catch (err) {
    console.error("Error uploading file:", err);
    throw err;
  }
};
