// Backend Integration Service
// Abstract interfaces and base implementations for integrating with external systems

/**
 * Base interface for all backend integrations
 */
export interface BackendIntegration {
  name: string;
  type: 'ehr' | 'crm' | 'oms' | 'pms' | 'cms' | 'other';
  isConnected: boolean;
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  healthCheck(): Promise<boolean>;
}

/**
 * EHR (Electronic Health Record) Integration Interface
 */
export interface EHRIntegration extends BackendIntegration {
  type: 'ehr';
  
  // Appointment Management
  checkAppointmentAvailability(department: string, dateRange?: { start: Date; end: Date }): Promise<AppointmentSlot[]>;
  bookAppointment(patientId: string, appointment: AppointmentRequest): Promise<Appointment>;
  cancelAppointment(appointmentId: string): Promise<boolean>;
  getAppointment(appointmentId: string): Promise<Appointment | null>;
  
  // Patient Management
  getPatient(patientId: string): Promise<Patient | null>;
  searchPatients(query: string): Promise<Patient[]>;
  
  // Prescription Management
  getPrescription(prescriptionNumber: string): Promise<Prescription | null>;
  requestPrescriptionRefill(prescriptionNumber: string, patientId: string): Promise<RefillRequest>;
  
  // Lab Results
  getLabResults(patientId: string, dateOfBirth: string): Promise<LabResult[]>;
  
  // Billing
  getBillingInfo(accountNumber: string): Promise<BillingInfo | null>;
  getClaimInfo(claimNumber: string): Promise<ClaimInfo | null>;
}

/**
 * CRM (Customer Relationship Management) Integration Interface
 */
export interface CRMIntegration extends BackendIntegration {
  type: 'crm';
  
  // Contact Management
  getContact(contactId: string): Promise<Contact | null>;
  searchContacts(query: string): Promise<Contact[]>;
  createContact(contact: ContactData): Promise<Contact>;
  updateContact(contactId: string, updates: Partial<ContactData>): Promise<Contact>;
  
  // Account Management
  getAccount(accountId: string): Promise<Account | null>;
  searchAccounts(query: string): Promise<Account[]>;
  
  // Case/Ticket Management
  createCase(caseData: CaseData): Promise<Case>;
  getCase(caseId: string): Promise<Case | null>;
  updateCase(caseId: string, updates: Partial<CaseData>): Promise<Case>;
  
  // Activity Tracking
  logCallActivity(contactId: string, callData: CallActivityData): Promise<void>;
}

/**
 * OMS (Order Management System) Integration Interface
 */
export interface OMSIntegration extends BackendIntegration {
  type: 'oms';
  
  // Order Management
  getOrder(orderNumber: string): Promise<Order | null>;
  searchOrders(query: string): Promise<Order[]>;
  getOrderStatus(orderNumber: string): Promise<OrderStatus>;
  updateOrderStatus(orderNumber: string, status: OrderStatus): Promise<boolean>;
  
  // Returns Management
  createReturn(orderNumber: string, returnData: ReturnData): Promise<Return>;
  getReturn(returnId: string): Promise<Return | null>;
  
  // Product Information
  getProduct(productId: string): Promise<Product | null>;
  searchProducts(query: string): Promise<Product[]>;
  
  // Store Information
  getStoreLocations(location?: { lat: number; lng: number }): Promise<StoreLocation[]>;
}

/**
 * PMS (Project Management System) Integration Interface
 */
export interface PMSIntegration extends BackendIntegration {
  type: 'pms';
  
  // Project Management
  getProject(projectId: string): Promise<Project | null>;
  searchProjects(query: string): Promise<Project[]>;
  createProject(projectData: ProjectData): Promise<Project>;
  
  // Vendor Management
  getVendor(vendorId: string): Promise<Vendor | null>;
  searchVendors(query: string): Promise<Vendor[]>;
  
  // Permit Management
  getPermitStatus(permitNumber: string): Promise<PermitStatus | null>;
  
  // Warranty Management
  createWarrantyClaim(claimData: WarrantyClaimData): Promise<WarrantyClaim>;
  getWarrantyClaim(claimId: string): Promise<WarrantyClaim | null>;
}

/**
 * CMS (Claims Management System) Integration Interface
 */
export interface CMSIntegration extends BackendIntegration {
  type: 'cms';
  
  // Claims Management
  createClaim(claimData: ClaimData): Promise<Claim>;
  getClaim(claimId: string): Promise<Claim | null>;
  getClaimStatus(claimId: string): Promise<ClaimStatus>;
  updateClaim(claimId: string, updates: Partial<ClaimData>): Promise<Claim>;
  
  // Policy Management
  getPolicy(policyNumber: string): Promise<Policy | null>;
  getPolicyInfo(policyNumber: string): Promise<PolicyInfo>;
  
  // Payment Processing
  processPayment(paymentData: PaymentData): Promise<PaymentResult>;
  getPaymentHistory(policyNumber: string): Promise<Payment[]>;
}

// Type Definitions

export interface AppointmentSlot {
  date: Date;
  time: string;
  provider?: string;
  department: string;
}

export interface AppointmentRequest {
  patientId: string;
  department: string;
  preferredDate?: Date;
  preferredTime?: string;
  reason?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  department: string;
  date: Date;
  time: string;
  provider?: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
}

export interface Patient {
  id: string;
  name: string;
  dateOfBirth: Date;
  phoneNumber?: string;
  email?: string;
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  medication: string;
  quantity: number;
  refillsRemaining: number;
  status: 'active' | 'expired' | 'refilled';
}

export interface RefillRequest {
  id: string;
  prescriptionNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  estimatedReadyDate?: Date;
}

export interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  date: Date;
  status: 'pending' | 'completed' | 'abnormal';
  results?: string;
}

export interface BillingInfo {
  accountNumber: string;
  balance: number;
  lastPaymentDate?: Date;
  nextPaymentDue?: Date;
  claims: ClaimInfo[];
}

export interface ClaimInfo {
  claimNumber: string;
  date: Date;
  amount: number;
  status: 'pending' | 'approved' | 'denied' | 'paid';
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
}

export interface ContactData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
}

export interface Account {
  id: string;
  name: string;
  industry?: string;
  contacts: Contact[];
}

export interface Case {
  id: string;
  contactId: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  description?: string;
}

export interface CaseData {
  contactId: string;
  subject: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface CallActivityData {
  callId: string;
  duration: number;
  direction: 'inbound' | 'outbound';
  outcome: string;
  recordingUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingAddress?: Address;
  createdAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

export interface ReturnData {
  orderNumber: string;
  items: Array<{ productId: string; quantity: number; reason: string }>;
}

export interface Return {
  id: string;
  orderNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  refundAmount: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  inStock: boolean;
  stockQuantity?: number;
}

export interface StoreLocation {
  id: string;
  name: string;
  address: Address;
  phone?: string;
  hours?: StoreHours;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

export interface StoreHours {
  [day: string]: { open: string; close: string };
}

export interface Project {
  id: string;
  name: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed';
  startDate?: Date;
  endDate?: Date;
}

export interface ProjectData {
  name: string;
  description?: string;
  startDate?: Date;
}

export interface Vendor {
  id: string;
  name: string;
  contact: Contact;
  services: string[];
}

export interface PermitStatus {
  permitNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  issueDate?: Date;
  expiryDate?: Date;
}

export interface WarrantyClaimData {
  projectId: string;
  description: string;
  issueDate: Date;
}

export interface WarrantyClaim {
  id: string;
  projectId: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  submittedDate: Date;
}

export interface Claim {
  id: string;
  claimNumber: string;
  policyNumber: string;
  type: string;
  amount: number;
  status: ClaimStatus;
  submittedDate: Date;
}

export interface ClaimData {
  policyNumber: string;
  type: string;
  description: string;
  amount: number;
  incidentDate: Date;
}

export type ClaimStatus = 'submitted' | 'under_review' | 'approved' | 'denied' | 'paid';

export interface Policy {
  id: string;
  policyNumber: string;
  type: string;
  status: 'active' | 'expired' | 'cancelled';
  effectiveDate: Date;
  expiryDate?: Date;
}

export interface PolicyInfo {
  policyNumber: string;
  type: string;
  coverage: string[];
  premium: number;
  nextPaymentDue?: Date;
}

export interface PaymentData {
  policyNumber: string;
  amount: number;
  paymentMethod: 'credit_card' | 'bank_transfer' | 'check';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface Payment {
  id: string;
  amount: number;
  date: Date;
  method: string;
  status: 'completed' | 'pending' | 'failed';
}
