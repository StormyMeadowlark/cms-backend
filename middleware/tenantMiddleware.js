const axios = require("axios");

const TENANT_SERVICE_URL = "https://skynetrix.tech/api/v1/verify-tenant";

const tenantMiddleware = async (req, res, next) => {
  const tenantId = req.header("x-tenant-id");
  const token = req.header("Authorization")?.split(" ")[1];

  console.log("[TENANT] Validating tenant:", tenantId);

  if (!tenantId) {
    console.log("[TENANT] Missing X-Tenant-Id header.");
    return res.status(400).json({ error: "X-Tenant-Id header is required" });
  }

  // Prepare the headers object
  const headers = {
    "x-tenant-id": tenantId,
  };

  // Include Authorization header only if the token is present
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await axios.get(TENANT_SERVICE_URL, {
      headers,
    });

    if (response.status === 200 && response.data.isValid) {
      console.log("[TENANT] Tenant is valid.");
      req.tenantId = tenantId;
      next();
    } else {
      console.error("[TENANT] Invalid tenant ID.");
      return res.status(401).json({ error: "Invalid tenant ID." });
    }
  } catch (error) {
    console.error("[TENANT] Error validating tenant:", error.message);
    return res.status(500).json({ error: "Error validating tenant." });
  }
};

module.exports = tenantMiddleware;
