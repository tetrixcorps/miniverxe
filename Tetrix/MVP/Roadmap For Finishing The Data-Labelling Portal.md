## Roadmap For Finishing The Data-Labelling Portal

Below is an ordered, actionable checklist that turns the scaffolded codebase into a production-ready SaaS.  Each subsection cites the relevant reference so your team can jump directly to examples or boiler-plate.



Core Features (Derived from Your Business Model)
Your portal must support the core functions that make data labeling services profitable and efficient. Based on competitor features, these are the must-haves:

Role-Based Access Control (RBAC): Different views and permissions for Admins, Reviewers, and Annotators to manage projects, assign tasks, and perform quality assurance.

Project & Task Management: A central dashboard to create projects, upload datasets, assign tasks to annotators, and track progress with real-time status updates.

Integrated QA Workflow: A Human-in-the-Loop (HITL) system for reviewers to approve, reject, or comment on labeled data, ensuring high-quality output which is critical for premium pricing.

Annotation Tool Integration: Seamlessly embed an external tool like Label Studio or leverage its API/SDK to handle the core annotation work.

Analytics & Reporting: Dashboards to monitor annotator performance, project velocity, and overall quality metrics, which are key for managing costs and demonstrating value to clients.

Billing & Client Management: An admin-only section to manage client accounts, track usage (per-label, per-hour), and handle invoicing based on your chosen pricing models



### **1. Tighten Role-Based UI (RBAC)**

**Goal:** Only show components an authenticated role should see.

- Define canonical roles in the back end (`TaskAdmin`, `Reviewer`, `Labeler`, `BillingAdmin`, `Owner`).
- Expose `role` and granular `permissions` in the JWT payload.
- React-admin already supports per-resource guards via `authProvider.canAccess()`[^1].
- For page-level gating wrap components with `<Authenticated>` or supply `requireAuth` to `<Admin>`[^1].
- Inside each React component add a small helper:

```ts
import { usePermissions } from 'react-admin';
export const useCan = (action: string) => {
  const { permissions } = usePermissions();     // comes from JWT
  return permissions?.includes(action);         // e.g., 'task.assign'
};
```

- Hide assignment buttons:

```tsx
{useCan('task.assign') && <AssignTaskButton />}
```


Flesh out UI components per role: Use React-Admin's permission system to show/hide buttons and pages based on user roles (e.g., only Admins can create projects, only Reviewers see the "Approve/Reject" buttons).

Implement QA workflows: Create a custom page for reviewing tasks that shows the labeled data (e.g., in an iframe from Label Studio) alongside "Approve" and "Reject" buttons that call your API.

Add analytics dashboards: Use a chart library like Recharts to visualize data from your API's metrics endpoints.

Integrate billing and plan management: Build an admin-only section to manage client data and connect to a service like Stripe for subscription handling.

Harden security and deploy: Implement HTTPS, set up rate limiting, add comprehensive logging, and use Docker to deploy your API and frontend to a DigitalOcean.



### **2. Build End-To-End QA Workflow**

| Step | Back-end action | Front-end control |
| :-- | :-- | :-- |
| Submit label | `POST /labels/:id/submit` (status = Submitted) | Hidden for non-Labelers |
| Review label | `PATCH /labels/:id/review {approve|reject}` | Only visible to `Reviewer` role |
| Thread comments | `POST /labels/:id/comments` | Conversation drawer |
| Approval gate | Workflow engine sets next status or reverts on reject[^4] | Status badge \& toast |

Implementation pointers:

- Model statuses: `InProgress → Submitted → Approved/Rejected` mirroring Superb-AI’s manual QA cycle[^5].
- Auto-create an “Issue Thread” record whenever a reviewer rejects a label and push a notification to the original labeler[^5].
- Expose review metrics (`approvedRate`, `avgReworkCount`) on the project dashboard.


### **3. Ship Analytics Dashboards**

1. **API** – add `/metrics/*` endpoints returning JSON series already shaped for charts.
2. **Data fetching** – wrap with `useQuery('metrics', …)` from React-Query for caching and retries.
3. **Charts** – start with Recharts:
```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
const { data } = useQuery(['metrics', projectId], fetchMetrics);
return (
  <LineChart width={600} height={300} data={data}>
     <XAxis dataKey="date" /><YAxis />
     <Tooltip />
     <Line type="monotone" dataKey="approvedRate" stroke="#8884d8" />
  </LineChart>
);
```

Recharts is lightweight, React-only and well-documented for dashboards[^6][^7]. For more exotic visuals (heat-maps, radial bars) consider Victory as a drop-in alternative.

### **4. Add Billing \& Subscription Management**

| Flow | Stack choice |
| :-- | :-- |
| Self-serve checkout | Stripe Elements (React) – follow step-by-step copy routine[^8] |
| In-app plan switch | Clerk Billing (if you already use Clerk for auth) – enables pricing table \& user-portal out-of-box[^9] |

- Store `plan`, `seatCount`, `billingStatus` in the `users` or `organizations` collection.
- Guard premium features via the same `useCan('feature.premium')` helper.
- Send Stripe webhooks (or Clerk events) → `POST /billing/webhook` to update DB and invalidate permissions cache.


### **5. Harden Security \& Dev Ops**

**HTTPS everywhere**
– In production terminate TLS at Cloudflare or an Nginx ingress.
– Local dev: `mkcert` self-signed certs.

**Rate-limiting**
– Protect `/login` and `/api/*` with Cloudflare WAF rules (e.g., 4 bad logins / 1 min triggers challenge)[^10].
– Apply sliding-window algorithm at API gateway for token-authenticated users[^11].

**Audit \& logging**
– Use `winston` with JSON output → Loki/Grafana or CloudWatch.
– Log every permission failure (`403`) and webhook error for incident replay.

**CI/CD**
– Add GitHub Action building multi-arch Docker images and pushing to Docker Hub[^12].
– Job matrix: `lint → test → build → push → deploy`.
– Enforce branch protection + required status checks.

**Container security**
– Enable Docker image scanning (GH-native or Trivy).
– Run containers as non-root, set read-only FS except `/tmp`.

## Deliverables Timeline

| Week | Milestone |
| :-- | :-- |
| 1 | RBAC payload, `authProvider`, conditional UI done |
| 2 | Label QA endpoints \& review UI, issue threads |
| 3 | Analytics dashboard MVP with Recharts \& React-Query |
| 4 | Stripe / Clerk billing integration + plan gating |
| 5 | Cloudflare rate-limit rules, HTTPS, structured logging |
| 6 | GitHub Actions pipeline → staging → production |

Once these items are completed, the portal will cover the full lifecycle: authenticated access, labeling, QA, analytics, monetization, and hardened operations.

