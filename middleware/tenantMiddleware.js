const tenantMiddleware = async (req, res, next) => {
  const tenantId = req.header("X-Tenant-Id");
  const token = req.header("Authorization").split(" ")[1];

  console.log("[tenantMiddleware] Validating tenant:", tenantId);

  if (!tenantId) {
    return res.status(400).json({ error: "X-Tenant-Id header is required" });
  }

  const isValid = await validateTenant(tenantId, token);

  if (!isValid) {
    console.error("[tenantMiddleware] Invalid tenant ID.");
    return res.status(401).json({ error: "Invalid tenant ID." });
  }

  req.tenantId = tenantId;
  next();
};
