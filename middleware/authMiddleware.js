const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    let token = req.header("Authorization");
    console.log("[AUTH] Received Authorization header:", token);

    if (!token || !token.startsWith("Bearer ")) {
      console.log("[AUTH] No or improperly formatted token provided.");
      return res
        .status(401)
        .json({ error: "No or improperly formatted token provided." });
    }

    token = token.replace(/Bearer\s+/g, "").trim();

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log("[AUTH] JWT verification error:", err.message);
        return res.status(401).json({ error: "Invalid token." });
      }

      console.log(
        "[AUTH] JWT verified successfully. Decoded payload:",
        decoded
      );

      req.user = { _id: decoded.userId };
      req.tenantId = decoded.tenantId;

      next();
    });
  } catch (error) {
    console.error("[AUTH] Error in authMiddleware:", error.message);
    res.status(500).json({ error: "Internal server error in authMiddleware." });
  }
};

module.exports = authMiddleware;
