const hubspot = require('@hubspot/api-client');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), 'hubspot.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log("Starting HubSpot Setup Script...");

const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;

if (!accessToken) {
  console.error('Error: HUBSPOT_ACCESS_TOKEN not found in environment variables.');
  process.exit(1);
}

const hubspotClient = new hubspot.Client({ accessToken });

async function createProperty(groupName, name, label, type = 'string', fieldType = 'text') {
  try {
    console.log(`Checking property: ${name}...`);
    await hubspotClient.crm.properties.coreApi.getByName('contacts', name);
    console.log(`Property ${name} already exists.`);
  } catch (e) {
    if (e.code === 404) {
      console.log(`Creating property: ${name}...`);
      try {
        await hubspotClient.crm.properties.coreApi.create('contacts', {
          name,
          label,
          type,
          fieldType,
          groupName,
          description: 'Created via API for Website Contact Form',
          hidden: false,
          displayOrder: -1,
          hasUniqueValue: false,
          formField: true
        });
        console.log(`Property ${name} created.`);
      } catch (createError) {
        console.error(`Failed to create property ${name}:`, createError.message);
      }
    } else {
      console.error(`Error checking property ${name}:`, e.message);
    }
  }
}

async function createContactForm() {
  const formName = "Website Contact Us Form (API Generated)";
  
  // Define form fields
  const formFields = [
    {
      name: "email",
      label: "Email",
      required: true,
      fieldType: "email", 
    },
    {
      name: "firstname",
      label: "First Name",
      required: true,
      fieldType: "single_line_text",
    },
    {
      name: "company",
      label: "Company",
      required: false,
      fieldType: "single_line_text",
    },
    {
      name: "web_contact_subject",
      label: "Subject",
      required: true,
      fieldType: "single_line_text",
    },
    {
      name: "web_contact_message",
      label: "Message",
      required: true,
      fieldType: "multi_line_text",
    }
  ];

  console.log("Creating/Verifying Form...");
  
  const formPayload = {
    name: formName,
    configuration: {
      createNewContactForNewEmail: true,
      notifyRecipients: [], 
    },
    fieldGroups: [
      {
        groupType: "default_group",
        richTextType: "text",
        fields: formFields.map(field => ({
          name: field.name,
          label: field.label,
          required: field.required,
          fieldType: field.fieldType,
          contactProperty: field.name 
        }))
      }
    ],
    displayOptions: {
      renderRawHtml: true,
      theme: "canvas", 
      style: {
          submitButton: {
              alignment: "left",
              text: "Send Message"
          }
      }
    },
    legalConsentOptions: {
        type: "none" 
    }
  };

  try {
    const response = await hubspotClient.marketing.forms.formsApi.create(formPayload);
    console.log("--------------------------------------------------");
    console.log("Form Created Successfully!");
    console.log(`Form Name: ${response.name}`);
    console.log(`Form ID (GUID): ${response.id}`);
    console.log("--------------------------------------------------");
    console.log("\nPlease update your hubspot.env file with this GUID:");
    console.log(`HUBSPOT_CONTACT_FORM_GUID=${response.id}`);
    console.log("--------------------------------------------------");
    
  } catch (e) {
    console.error("Error creating form:", JSON.stringify(e.response?.body || e.message, null, 2));
  }
}

async function main() {
  await createProperty('contactinformation', 'web_contact_subject', 'Web Contact Subject');
  
  // Handle message separately to ensure textarea type
  try {
      console.log(`Checking property: web_contact_message...`);
      await hubspotClient.crm.properties.coreApi.getByName('contacts', 'web_contact_message');
      console.log(`Property web_contact_message already exists.`);
  } catch (e) {
      if (e.code === 404) {
          console.log(`Creating property: web_contact_message...`);
           await hubspotClient.crm.properties.coreApi.create('contacts', {
            name: 'web_contact_message',
            label: 'Web Contact Message',
            type: 'string',
            fieldType: 'textarea',
            groupName: 'contactinformation',
             description: 'Created via API for Website Contact Form',
             hidden: false, displayOrder: -1, hasUniqueValue: false, formField: true
          });
          console.log(`Property web_contact_message created.`);
      } else {
        console.error(`Error checking web_contact_message:`, e.message);
      }
  }

  await createContactForm();
}

main();

