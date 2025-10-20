# TETRIX Dashboard Authentication & Routing System

## Overview
This document maps the complete authentication mechanism and dashboard routing system for TETRIX industry-specific dashboards.

## Authentication Flow

### 1. Industry Selection Process
```typescript
// Industry options available in IndustryAuth.astro
const industries = {
  healthcare: { label: '🏥 Healthcare', roles: ['doctor', 'nurse', 'admin', 'specialist'] },
  construction: { label: '🏗️ Construction', roles: ['project_manager', 'site_supervisor', 'safety_officer', 'foreman'] },
  logistics: { label: '🚛 Logistics & Fleet', roles: ['fleet_manager', 'dispatcher', 'driver', 'operations'] },
  government: { label: '🏛️ Government', roles: ['department_head', 'citizen_services', 'emergency_services', 'permit_office'] },
  education: { label: '🎓 Education', roles: ['principal', 'teacher', 'admin', 'parent'] },
  retail: { label: '🛒 Retail', roles: ['store_manager', 'sales_associate', 'inventory', 'customer_service'] },
  hospitality: { label: '🏨 Hospitality', roles: ['general_manager', 'front_desk', 'concierge', 'guest_services'] },
  wellness: { label: '💪 Wellness', roles: ['facility_manager', 'trainer', 'nutritionist', 'reception'] },
  beauty: { label: '💄 Beauty', roles: ['salon_manager', 'stylist', 'esthetician', 'reception'] },
  legal: { label: '⚖️ Legal', roles: ['partner', 'associate', 'paralegal', 'admin'] }
};
```

### 2. Authentication Data Structure
```typescript
interface AuthData {
  industry: string;
  role: string;
  organization: string;
  phoneNumber: string;
  verificationId: string;
  authToken: string;
  authMethod: '2fa';
  timestamp: number;
}
```

### 3. Dashboard Routing Logic
```typescript
// Dashboard URL mapping from IndustryAuth.astro
const industryDashboards = {
  healthcare: '/dashboards/healthcare',
  construction: '/dashboards/construction',
  logistics: '/dashboards/logistics',
  government: '/dashboards/government',
  education: '/dashboards/education',
  retail: '/dashboards/retail',
  hospitality: '/dashboards/hospitality',
  wellness: '/dashboards/wellness',
  beauty: '/dashboards/beauty',
  legal: '/dashboards/legal'
};
```

## Dashboard Implementation Status

### ✅ Fully Implemented Dashboards

#### 1. Healthcare Dashboard (`/dashboards/healthcare`)
**Features:**
- Patient metrics (48 patients today, 32 appointments scheduled)
- Emergency triage system with priority levels
- Appointment scheduling and management
- Patient communication tracking
- HIPAA-compliant integrations (Epic, Cerner, Allscripts)
- Real-time activity monitoring
- Pricing tiers with 7-day free trial

**Key Metrics:**
- Patients Today: 48
- Appointments Scheduled: 32
- Emergency Cases: 3
- Patient Satisfaction: 4.8/5

**Integrations:**
- Epic MyChart
- Salesforce CRM
- HubSpot Marketing
- Workflow Automation

#### 2. Construction Dashboard (`/dashboards/construction`)
**Features:**
- Project status tracking (12 active projects)
- Safety alerts and compliance monitoring
- Worker management (156 workers on site)
- Resource allocation and scheduling
- Project completion tracking
- Safety incident reporting

**Key Metrics:**
- Active Projects: 12
- Completed This Month: 8
- Safety Alerts: 3
- Workers On Site: 156

#### 3. Logistics & Fleet Dashboard (`/dashboards/logistics`)
**Features:**
- Real-time vehicle tracking (24 active vehicles)
- Delivery management (156 deliveries today)
- Driver communication and management
- Route optimization
- Fleet maintenance alerts
- Performance analytics

**Key Metrics:**
- Active Vehicles: 24
- Deliveries Today: 156
- Average Delivery Time: 2.3h
- Alerts: 5

### 🔧 Supporting Services

#### 1. Dashboard Service (`src/services/dashboardService.ts`)
- Universal metrics for all industries
- Industry-specific data fetching
- Real-time updates via polling
- Data export functionality (CSV, PDF, Excel)
- Mock data generators for MVP

#### 2. Healthcare Integrations (`src/services/healthcareIntegrations.ts`)
- Epic MyChart integration
- Cerner PowerChart integration
- Allscripts Professional EHR
- NextGen Healthcare
- athenahealth
- HIPAA compliance helpers
- Patient data management
- Appointment scheduling
- Insurance claim processing

#### 3. Dashboard Product Service (`src/services/dashboardProductService.ts`)
- Product catalog management
- Shopping cart functionality
- Checkout processing
- Industry-specific product filtering
- Stripe integration for payments

## Authentication Mechanism Flow

### Step 1: User Clicks "Client Login"
```javascript
// From header-auth.js
document.getElementById('client-login-2fa-btn')?.addEventListener('click', () => {
  window.tetrixAuthContext = 'industry';
  openIndustryAuth();
});
```

### Step 2: Industry Selection Modal Opens
```javascript
// From IndustryAuth.astro
window.openIndustryAuthModal = function() {
  const modal = document.getElementById('industry-auth-modal');
  modal.classList.remove('hidden');
  // User selects industry, role, and organization
};
```

### Step 3: 2FA Authentication
```javascript
// After form submission, 2FA modal opens
const twoFAResult = await show2FAModal();
// User enters phone number and receives verification code
```

### Step 4: Authentication Data Storage
```javascript
// Store authentication data
const authData = {
  industry,
  role,
  organization,
  phoneNumber: twoFAResult.phoneNumber,
  verificationId: twoFAResult.verificationId,
  authToken: twoFAResult.token,
  authMethod: '2fa',
  timestamp: Date.now()
};
localStorage.setItem('tetrixAuth', JSON.stringify(authData));
```

### Step 5: Dashboard Redirect
```javascript
// Redirect to appropriate dashboard
const dashboardUrl = industryDashboards[industry];
window.location.href = `${dashboardUrl}?token=${twoFAResult.token}`;
```

## Dashboard Access Control

### Authentication Check
Each dashboard page checks for authentication:
```javascript
// From DashboardLayout.astro
document.addEventListener('DOMContentLoaded', () => {
  const authData = localStorage.getItem('tetrixAuth');
  if (!authData) {
    alert('Please authenticate to access this dashboard');
    window.location.href = '/';
    return;
  }
  // Parse and validate auth data
});
```

### Role-Based Access
Different roles within each industry have different permissions:
- **Healthcare**: Doctor (full access), Nurse (patient care), Admin (management)
- **Construction**: Project Manager (full access), Site Supervisor (site management), Safety Officer (safety focus)
- **Logistics**: Fleet Manager (full access), Dispatcher (routing), Driver (delivery focus)

## Data Flow Architecture

### 1. Real-Time Updates
```typescript
// From dashboardService.ts
async subscribeToRealTimeUpdates(industry: IndustryType, callback: (data: any) => void) {
  setInterval(async () => {
    const data = await this.getIndustryMetrics(industry, userRole);
    callback(data);
  }, 30000); // Update every 30 seconds
}
```

### 2. Industry-Specific Metrics
Each industry has tailored metrics:
- **Healthcare**: Patient count, appointments, emergency cases, satisfaction
- **Construction**: Active projects, safety alerts, worker count, completion rate
- **Logistics**: Vehicle count, deliveries, delivery time, alerts

### 3. Integration Points
- **EHR Systems**: Epic, Cerner, Allscripts for healthcare
- **CRM Systems**: Salesforce, HubSpot for customer management
- **Communication**: SMS, Voice, Email via Telnyx and Sinch
- **Payment Processing**: Stripe for subscription management

## Security & Compliance

### 1. HIPAA Compliance (Healthcare)
- Data encryption for sensitive patient information
- Audit logging for all access
- Secure API endpoints
- Role-based access control

### 2. 2FA Security
- Phone number verification via SMS/Voice
- Time-limited verification codes
- Secure token generation
- Session management

### 3. Data Protection
- Local storage for session data
- Secure API communication
- Input validation and sanitization
- CORS protection

## Future Enhancements

### 1. Additional Industries
- Manufacturing
- Real Estate
- Financial Services
- Non-Profit

### 2. Advanced Features
- AI-powered insights
- Predictive analytics
- Advanced reporting
- Mobile applications

### 3. Integration Expansion
- More EHR systems
- IoT device integration
- Advanced CRM features
- Custom API endpoints

## Testing Strategy

### 1. Authentication Flow Testing
- Industry selection validation
- Role-based access testing
- 2FA verification testing
- Dashboard redirect testing

### 2. Dashboard Functionality Testing
- Real-time data updates
- Integration connectivity
- User interface responsiveness
- Error handling

### 3. Security Testing
- Authentication bypass attempts
- Data validation testing
- API security testing
- Compliance verification

This comprehensive mapping provides the foundation for understanding and extending the TETRIX dashboard authentication and routing system.
