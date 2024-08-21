const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided." });
  }

  const actualToken = token.split(" ")[1];

  jwt.verify(actualToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("JWT verification error:", err);
      return res.status(401).json({ error: "Invalid token." });
    }

    req.user = decoded; // Attach the decoded token payload to req.user
    next();
  });
};

module.exports = authMiddleware;
