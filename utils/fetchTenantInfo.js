const axios = require("axios");

/**
 * Fetch tenant information from an external API.
 * @param {string} tenantId - The ID of the tenant.
 * @returns {Promise<Object>} - The tenant's information including SendGrid API key and verified sender email.
 */
const fetchTenantInfo = async (tenantId) => {
  try {
    console.log(
      "[FETCH TENANT INFO] Fetching information for tenant ID:",
      tenantId
    );

    // Make an HTTP GET request to the external API to fetch tenant information
    const response = await axios.get(
      `https://skynetrix-user-management-ad21b5714f45.herokuapp.com/api/${tenantId}`
    ); // Replace with your actual API endpoint

    if (response.status !== 200 || !response.data) {
      throw new Error("Failed to fetch tenant information.");
    }

    const tenantInfo = response.data;
    console.log("[FETCH TENANT INFO] Tenant information fetched:", tenantInfo);

    return {
      sendGridApiKey: tenantInfo.sendGridApiKey, // Adjust based on the actual API response structure
      verifiedSenderEmail: tenantInfo.verifiedSenderEmail, // Adjust based on the actual API response structure
    };
  } catch (error) {
    console.error(
      "[FETCH TENANT INFO] Error fetching tenant information:",
      error.message
    );
    throw error;
  }
};

module.exports = { fetchTenantInfo };
