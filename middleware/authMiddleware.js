// In your authMiddleware.js file

const jwt = require("jsonwebtoken"); 
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");
  console.log("[AUTH] Received Authorization header:", token);

  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided." });
  }

  const actualToken = token.split(" ")[1];
  jwt.verify(actualToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("[AUTH] JWT verification error:", err);
      return res.status(401).json({ error: "Invalid token." });
    }

    console.log("[AUTH] JWT verified successfully. Decoded payload:", decoded);
    req.user = { _id: decoded.userId };
    req.tenantId = decoded.tenantId;
    next();
  });
};

module.exports = authMiddleware;
