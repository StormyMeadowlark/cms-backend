const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.verifyAdmin = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user || user.role !== "Admin") {
      throw new Error();
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(403).send({ error: "Access denied" });
  }
};

exports.verifyEditor = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user || (user.role !== "Admin" && user.role !== "Editor")) {
      throw new Error();
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(403).send({ error: "Access denied" });
  }
};

// Define verifyUser middleware
exports.verifyUser = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate" });
  }
};
