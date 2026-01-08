# Compliance and Customization Guide for TETRIX

## Overview
This document outlines the customization strategies for industry-specific workflows and ensures compliance with Meta's policies for the **Marketing Messages API for WhatsApp** (formerly Lite API). It aligns with the TETRIX ecosystem, covering Construction, Fleet Management, and Healthcare dashboards.

---

## 1. Meta Compliance & Onboarding

### Eligibility & Restrictions
To use the Marketing Messages API, TETRIX must adhere to:
*   **Vertical Restrictions**: Ensure industry verticals (Construction, Logistics, Healthcare) are permitted in the target country.
*   **Opt-In Policy**: Users must explicitly opt-in to receive marketing messages.
    *   *Implementation*: Add a clear opt-in checkbox in the dashboard user profile or registration flow.
    *   *Compliance Check*: Store opt-in timestamp and source.
*   **Message Categories**: Only **Marketing** templates with optimizations are supported by this specific API. Utility/Authentication messages should continue using the standard Cloud API.

### Automated Onboarding Workflow
We have implemented an automated check for onboarding status:
1.  **Check Status**: `GET /<WABA_ID>?fields=marketing_messages_onboarding_status`
2.  **Status Values**:
    *   `ELIGIBLE`: Ready to onboard via App Dashboard.
    *   `ONBOARDED`: Ready to send optimized messages.
    *   `INELIGIBLE`: Review policy violations.

### Data Sharing & Privacy
*   **Event Activity Sharing**: By default, message status (delivered, read) is shared with Meta for optimization.
*   **Healthcare Compliance (HIPAA)**:
    *   **Recommendation**: For the **Healthcare Dashboard**, disable event activity sharing if message content or metadata could be construed as PHI (Protected Health Information), or ensure BAA with Meta covers this.
    *   *Customization*: Use `message_activity_sharing: false` in the API payload for healthcare-specific campaigns.

---

## 2. Industry-Specific Customizations

### 🏗️ Construction Dashboard (`src/components/dashboards/WorkflowAutomation.astro`)
**Use Cases:**
*   **Safety Alerts**: Broadcast instant safety warnings to site supervisors.
*   **Resource Allocation**: Notify teams of equipment availability.
*   **Shift Updates**: Send schedule changes for the next day.

**Recommendations:**
*   **IVR Integration**:
    *   *Inbound*: "Press 1 to report a safety incident." -> Triggers WhatsApp Template to Safety Officer.
    *   *Outbound*: Automated call for urgent site evacuation, followed by WhatsApp map location.
*   **Custom Features**:
    *   **Geo-Fenced Messaging**: Trigger messages when a worker enters/leaves a site zone (requires app integration).
    *   **Incident Reporting Bot**: Interactive WhatsApp flow to upload photos of safety hazards.

### 🚛 Fleet Management Dashboard (`src/components/dashboards/SalesforceIntegration.astro`)
**Use Cases:**
*   **Route Optimization**: Send optimized route links directly to drivers.
*   **Delivery Confirmation**: Automated "Package Arriving Soon" messages to end-customers.
*   **Maintenance Reminders**: Alert fleet managers of upcoming vehicle service.

**Recommendations:**
*   **Customer Support**:
    *   **Driver Bot**: Allow drivers to query "Where is my next stop?" via WhatsApp.
    *   **Two-Way Communication**: Enable dispatchers to chat directly with drivers from the dashboard.
*   **Marketing & Sales**:
    *   **Re-engagement**: Send offers to inactive logistics partners using the Optimized Marketing Messages API to increase read rates.

### 🏥 Healthcare Dashboard (`src/components/dashboards/EpicIntegration.astro`)
**Use Cases:**
*   **Appointment Reminders**: Reduce no-shows with interactive confirmation buttons.
*   **Post-Care Instructions**: Send PDF guides after visits.
*   **Vaccination Drives**: Broadcast availability to eligible patient groups.

**Recommendations:**
*   **Compliance (Crucial)**:
    *   **Strict Opt-In**: Double opt-in verification for health updates.
    *   **Data Minimization**: Avoid sending sensitive diagnosis details; use secure links instead.
    *   **Activity Sharing**: Default `message_activity_sharing` to `false`.
*   **IVR**:
    *   "Press 2 to reschedule." -> Sends WhatsApp scheduling link.

### 💼 CRM Integrations (HubSpot/Salesforce)
**Use Cases:**
*   **Lead Nurturing**: Automated follow-ups for new leads.
*   **Deal Updates**: Notify sales reps of contract status changes.

**Recommendations:**
*   **Sync**: Ensure WhatsApp opt-in status is synced 2-way with HubSpot/Salesforce.
*   **Triggers**: Use CRM workflows to trigger `sendMarketingMessage` calls based on lead score changes.

---

## 3. Technical Implementation Strategy

### New Service Methods
We have added the following to `WhatsAppCampaignService`:
*   `checkMarketingMessagesEligibility()`: Verifies if the WABA can use the optimized API.
*   `sendMarketingMessage()`: Sends messages using the `/marketing_messages` endpoint for higher ROI.

### Next Steps for Development
1.  **Dashboard UI Updates**:
    *   Add "WhatsApp Opt-In" status indicator to user profiles.
    *   Add "Onboarding Status" widget in the Settings page.
2.  **Webhook Handling**:
    *   Listen for `MM_LITE_TERMS_SIGNED` event to auto-enable features.
3.  **Template Management**:
    *   Create industry-specific Marketing templates in WhatsApp Manager.

---

## 4. Web Application Discovery
Based on the root directory analysis (`src/dashboards`), the application is structured as a **Multi-Tenant SaaS** built with **Astro**.

*   **Routing**: `dashboardRoutingService.ts` handles access control.
*   **Integrations**:
    *   **Epic**: Healthcare (EHR)
    *   **Salesforce/HubSpot**: CRM & Sales
    *   **Workflow**: General Operations

**Conclusion**: The WhatsApp integration should be exposed as a shared service (`campaign/whatsapp`) consumed by these individual dashboard components via a unified API or internal service call.

