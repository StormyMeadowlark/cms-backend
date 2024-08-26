const verifyRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.role; // Assuming req.user is set by auth middleware

    if (allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({ error: "Access denied." });
  };
};

module.exports = verifyRole;
