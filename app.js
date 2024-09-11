const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const postRoutes = require("./routes/postRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const commentRoutes = require("./routes/commentRoutes");
const tagRoutes = require("./routes/tagRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const emailRoutes = require("./routes/emailRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "https://hemautomotive.com",
      "http://localhost:3000",
      "https://stormymeadowlark.com",
      "http://127.0.0.1:5173",
      "http://localhost:5001",
      "http://localhost:5000",
      "https://skynetrix.tech",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "x-tenant-id", "Authorization"],
    credentials: true,
  })
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  console.log("[REQUEST] Headers:", req.headers);
  console.log("[REQUEST] Body:", req.body);
  next();
});

// API Routes
app.use("/api/newsletters", newsletterRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/analytics", analyticsRoutes);

// Basic Route
app.get("/", (req, res) => {
  console.log("[REQUEST] GET request to /");
  res.send("CMS Backend API");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
