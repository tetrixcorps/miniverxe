// Backend Integration Services Exports
// Centralized exports for all integration services

export type {
  BackendIntegration,
  EHRIntegration,
  CRMIntegration,
  OMSIntegration,
  PMSIntegration,
  CMSIntegration,
  AppointmentSlot,
  AppointmentRequest,
  Appointment,
  Patient,
  Prescription,
  RefillRequest,
  LabResult,
  BillingInfo,
  ClaimInfo,
  Contact,
  ContactData,
  Account,
  Case,
  CaseData,
  CallActivityData,
  Order,
  OrderStatus,
  Return,
  ReturnData,
  Product,
  StoreLocation
} from './backendIntegrationService';

export { EpicIntegration } from './epicIntegration';
export { SalesforceIntegration } from './salesforceIntegration';
export { ShopifyIntegration } from './shopifyIntegration';
