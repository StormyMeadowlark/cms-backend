const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.verifyAdmin = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    console.log("Token:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);

    const user = await User.findById(decoded._id);
    console.log("User found:", user);

    if (!user || user.role !== "Admin") {
      console.log("Access denied: User is not an admin");
      return res.status(403).send({ error: "Access denied" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error verifying admin:", error);
    res.status(403).send({ error: "Access denied" });
  }
};

exports.verifyEditor = async (req, res, next) => {
    try {
    const token = req.header("Authorization").replace("Bearer ", "");
    console.log("Token:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);

    const user = await User.findById(decoded._id);
    console.log("User found:", user);

    if (!user || user.role !== "Admin" || user.role !== "Editor") {
      console.log("Access denied: User is not an admin");
      return res.status(403).send({ error: "Access denied" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error verifying admin:", error);
    res.status(403).send({ error: "Access denied" });
  }
};


// Define verifyUser middleware
exports.verifyUser = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(401).send({ error: "Please authenticate" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate" });
  }
};