// models/Tag.js
const mongoose = require("mongoose");

const TagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

const Tag = mongoose.model("Tag", TagSchema);
module.exports = Tag;
