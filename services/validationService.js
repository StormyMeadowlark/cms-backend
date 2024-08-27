const axios = require("axios");

const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL;

const validateTenantAndUser = async (tenantId, userId, token) => {
  try {
    const response = await axios.get(`${USERS_SERVICE_URL}/validate`, {
      headers: {
        "X-Tenant-Id": tenantId,
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.isValid;
  } catch (error) {
    console.error("Error validating tenant and user:", error.message);
    return false;
  }
};

const validateUser = async (userId, token) => {
  try {
    const response = await axios.get(`${USERS_SERVICE_URL}/validateUser`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.isValid;
  } catch (error) {
    console.error("Error validating user:", error.message);
    return false;
  }
};
const validateTenant = async (tenantId, token) => {
  try {
    console.log(
      "[ValidationService] Sending validation request for tenant:",
      tenantId
    );

    const response = await axios.get(`${USERS_SERVICE_URL}/validateTenant`, {
      headers: {
        "X-Tenant-Id": tenantId,
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(
      "[ValidationService] Tenant validation response:",
      response.data
    );

    return response.data.isValid;
  } catch (error) {
    console.error(
      "[ValidationService] Error validating tenant:",
      error.message
    );
    return false;
  }
};
module.exports = {
  validateTenantAndUser,
  validateUser,
  validateTenant,
};
