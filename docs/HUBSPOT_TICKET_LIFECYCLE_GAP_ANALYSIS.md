# HubSpot Ticket Lifecycle Management Gap Analysis

## Overview
This document analyzes the current state of HubSpot integration in TETRIX versus a complete Help Desk and Ticket Lifecycle Management implementation as recommended by HubSpot best practices.

## 1. Help Desk Workspace Setup
**Current State:**
- Basic API integration to create tickets (`crm.tickets.basicApi.create`).
- Tickets are created in the default pipeline (`hs_pipeline: '0'`) and stage (`hs_pipeline_stage: '1'`).
- No dedicated "Help Desk" view or workspace configuration in the codebase (this is largely a HubSpot UI configuration).

**Gaps & Recommendations:**
- **Centralized Workspace:** You need to configure the [Help Desk workspace](https://knowledge.hubspot.com/help-desk/use-the-help-desk) in HubSpot to unify tickets from email, forms, and chat.
- **Teams & Users:** Ensure support agents are added to HubSpot and assigned to the correct Teams (Sales, Support, Billing).
- **Service Level Agreements (SLAs):** Configure SLAs in HubSpot to track response times (e.g., "Time to First Response").

## 2. Connecting Channels
**Current State:**
- **Forms:** We have integrated the "Contact Us" form to create tickets via API.
- **Email:** `support@tetrixcorp.com` is receiving emails via Mailgun. **Crucial Gap:** These emails are NOT automatically creating tickets in HubSpot unless the API integration does it.
- **Chat:** No chat integration found.

**Gaps & Recommendations:**
- **Connect Shared Inbox:** Connect `support@tetrixcorp.com` directly to HubSpot as a [Shared Inbox](https://knowledge.hubspot.com/inbox/connect-a-team-email-channel). This allows incoming emails to *automatically* create tickets without needing custom API middleware.
  - *Action:* Go to Settings > Inbox > Inboxes > Connect a channel > Email.
- **Forwarding Address:** If you keep Mailgun, ensure emails are forwarded to your HubSpot hosted email address (e.g., `support@your-portal-id.hubspot-inbox.com`) to capture them.

## 3. Managing Tickets (Routing, Status, Properties)
**Current State:**
- **Routing:** Basic code-based routing in `src/services/hubspot.ts` assigns tickets to the default pipeline based on subject keywords (Sales, Support, Billing).
- **Status:** Tickets default to 'New'.
- **Properties:** We capture Subject, Content, and associate with Contact.

**Gaps & Recommendations:**
- **Automated Routing (Workflows):** Instead of hardcoding logic in TypeScript, use HubSpot [Workflows](https://knowledge.hubspot.com/workflows/create-workflows) to route tickets.
  - *Example:* "If Ticket Subject contains 'Billing', set Pipeline to 'Billing Pipeline' and Rotate Owner among 'Billing Team'."
- **Pipelines:** Create distinct Pipelines for different workflows (e.g., "Support Pipeline" vs "Sales Pipeline").
  - *Action:* Configure in Settings > Objects > Tickets > Pipelines.
- **Custom Properties:** Create properties like `Issue Type`, `Urgency`, `Platform` to categorize tickets better than just "Subject".

## 4. Customer Portals
**Current State:**
- No customer portal implementation. Users cannot log in to see their ticket status.

**Gaps & Recommendations:**
- **Enable Customer Portal:** Turn on the [Customer Portal](https://knowledge.hubspot.com/customer-portal/set-up-your-customer-portal) feature in HubSpot Service Hub.
- **Authentication:** Decide if you want public access (via email link) or requires login.
- **Integration:** Link the "Support" section of your website to the HubSpot hosted Customer Portal.

## 5. Forms Strategy
**Current State:**
- Using a custom HTML form that calls a Next.js/Astro API route.
- Submitting data via CRM API (Contact + Ticket).

**Gaps & Recommendations:**
- **Marketing Forms API:** Switch to using the [Submit data to a form API](https://developers.hubspot.com/docs/api-reference/marketing-forms-v3/submit-data-to-a-form) (implemented in `hubspotService.submitForm`). This captures "Conversion" events, Source tracking (Organic Search vs Direct), and triggers Marketing Workflows.
- **Embedded Forms:** Consider replacing the custom HTML form with a [HubSpot Embedded Form](https://developers.hubspot.com/docs/cms/start-building/building-blocks/modules/forms). This allows non-technical users to update form fields (e.g., adding a "Phone Number" field) without code changes.

## Summary Checklist
1. [ ] **Security:** Source `hubspot.env` credentials securely.
2. [ ] **Config:** Obtain `HUBSPOT_PORTAL_ID` and `HUBSPOT_CONTACT_FORM_GUID`.
3. [ ] **Channel:** Connect `support@tetrixcorp.com` to HubSpot Inbox.
4. [ ] **Process:** Move routing logic from Code to HubSpot Workflows for flexibility.
5. [ ] **Portal:** Enable Customer Portal for ticket visibility.

