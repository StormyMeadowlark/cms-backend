const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Extract the Authorization header
  const token = req.header("Authorization");
  console.log("[AUTH] Received Authorization header:", token);

  // Check if the token is provided and properly formatted
  if (!token || !token.startsWith("Bearer ")) {
    console.log("[AUTH] No or improperly formatted token provided.");
    return res
      .status(401)
      .json({ error: "No or improperly formatted token provided." });
  }

  // Extract the actual token by removing the "Bearer " prefix
  const actualToken = token.split(" ")[1];

  // Verify the JWT using the secret
  jwt.verify(actualToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("[AUTH] JWT verification error:", err.message);
      return res.status(401).json({ error: "Invalid token." });
    }

    console.log("[AUTH] JWT verified successfully. Decoded payload:", decoded);

    // Attach user and tenant information to the request object
    req.user = { _id: decoded.userId };
    req.tenantId = decoded.tenantId;

    // Proceed to the next middleware or route handler
    next();
  });
};

module.exports = authMiddleware;
