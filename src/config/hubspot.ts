export const hubspotConfig = {
  accessToken: import.meta.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_ACCESS_TOKEN,
  developerApiKey: import.meta.env.HUBSPOT_DEVELOPER_API_KEY || process.env.HUBSPOT_DEVELOPER_API_KEY,
  portalId: import.meta.env.HUBSPOT_PORTAL_ID || process.env.HUBSPOT_PORTAL_ID,
  formGuid: import.meta.env.HUBSPOT_CONTACT_FORM_GUID || process.env.HUBSPOT_CONTACT_FORM_GUID,
};

export function validateHubSpotConfig() {
  const missing = [];
  if (!hubspotConfig.accessToken) missing.push('HUBSPOT_ACCESS_TOKEN');
  // Portal ID and Form GUID are required for Form API
  // if (!hubspotConfig.portalId) missing.push('HUBSPOT_PORTAL_ID');
  // if (!hubspotConfig.formGuid) missing.push('HUBSPOT_CONTACT_FORM_GUID');

  if (missing.length > 0) {
    console.warn(`HubSpot configuration missing: ${missing.join(', ')}`);
    return false;
  }
  return true;
}
