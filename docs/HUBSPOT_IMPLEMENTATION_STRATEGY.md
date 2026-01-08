# HubSpot Service Hub Implementation Strategy for TETRIX

## Executive Summary
For a startup with 100 Customer Service Representatives (CSRs) using Zoho Mail and HubSpot CRM, the most scalable and "Industry Best Practice" approach is to leverage **HubSpot Service Hub** as the central engine for ticketing, while maintaining Zoho as the email provider via forwarding.

This strategy balances cost, scalability, and operational efficiency.

## 1. Architecture Overview

### A. Email Flow (The "Ingestion" Layer)
Instead of migrating email hosting to HubSpot (which is not an email host), we connect your existing Zoho email to HubSpot.

1.  **Zoho Mail**: Continues to host `support@tetrixcorp.com`.
2.  **Forwarding**: Configure Zoho to automatically forward all incoming mail to your unique HubSpot Inbox address (e.g., `support@244023093.hubspot-inbox.com`).
3.  **SPF/DKIM**: Update DNS records to allow HubSpot to send emails *on behalf* of `support@tetrixcorp.com` so replies look native.

### B. Departmental Organization (The "Routing" Layer)
To manage 100 agents across departments (Sales, Support, Billing), we use **HubSpot Teams** and **Pipelines**.

*   **Teams**: Create "Tetrix Sales", "Tetrix Support", "Tetrix Billing" teams in HubSpot Settings. Assign agents to these teams.
*   **Queues**: Configure "Ticket Views" specific to each team.
    *   *Sales View*: Filter Tickets where `Pipeline` = "Sales" AND `Status` != "Closed".
    *   *Support View*: Filter Tickets where `Pipeline` = "Support" AND `Status` != "Closed".

### C. Ticket Generation & Routing
We replace manual API ticket creation (from the previous step) with **Native HubSpot Automation** for emails, while keeping the API for the Website Form.

1.  **Email-to-Ticket**: Enabling the "Shared Inbox" in HubSpot automatically turns forwarded emails into Tickets.
2.  **Routing Workflows**:
    *   *Trigger*: Ticket created from Email or Form.
    *   *Logic*: If Subject contains "Invoice" OR "Billing" -> Set Property `Department` to "Billing" -> Rotate Record to `Billing Team` -> Move to `Billing Pipeline`.

## 2. Implementation Options for Agent Access

### Option A: Native HubSpot Interface (Recommended Best Practice)
Agents log in directly to `app.hubspot.com`.
*   **Pros**: Full history, email tracking, internal notes, mobile app, SLA timers.
*   **Cons**: Requires a paid Seat for each user who needs advanced features (Service Hub Starter/Pro).
*   **Cost Efficiency**: 100 agents on "Service Hub Starter" is relatively affordable ($15-20/user/mo) compared to Enterprise tools. "Core" (Free) users can *view* tickets but not use advanced automation.

### Option B: Custom "Tetrix Admin Portal" (The API Approach)
Agents log in to your custom web app (`admin.tetrixcorp.com/tickets`).
*   **How**: We build a dashboard using the HubSpot API to fetch and display tickets.
*   **Pros**: No per-seat cost for viewing; fully customizable UI; integration with your other backend systems.
*   **Cons**: We must rebuild features (replying, changing status) from scratch; high development maintenance.

## 3. Recommended Solution: The "Hybrid" Start
1.  **Ingest & Route**: Set up the Zoho -> HubSpot forwarding and Routing Workflows immediately.
2.  **Custom Dashboard**: We will implement a **Custom Ticket Viewer** in your current application (Option B logic) to allow agents to *retrieve* and *view* tickets by department without needing 100 immediate HubSpot seats. This satisfies your request to "retrieve these tickets... specific to their departments".

## 4. Implementation Plan (Next Steps)

1.  **Service Layer**: Update `hubspot.ts` to include `getTicketsByDepartment()`.
2.  **Frontend**: Create `src/pages/admin/tickets.astro` to display these tickets.
3.  **Zoho Config**: You (User) will configure the forwarding rule in Zoho.

---
**Technical Note**: We will now proceed to implement the **Custom Dashboard** retrieval logic as requested.

