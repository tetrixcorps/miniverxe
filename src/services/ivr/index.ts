// IVR Service Exports
// Centralized exports for all IVR services

export { ivrService, type IVRConfig, type IVRCallFlow, type IVRStep, type IVRCallSession, type IVROption } from './ivrService';
export { callForwardingService, type ForwardingConfig, type Agent } from './callForwardingService';
export { ivrAnalyticsService, type IVRAnalytics, type CallMetrics } from './analyticsService';
export { speechRecognitionService, type SpeechRecognitionConfig, type SpeechRecognitionResult, type Intent, type Entity, type NLUConfig } from './speechRecognitionService';

// Industry-specific services
export { healthcareIVRService, type HealthcareIVRData } from './industry/healthcareIVR';
export { insuranceIVRService, type InsuranceIVRData } from './industry/insuranceIVR';
export { retailIVRService, type RetailIVRData } from './industry/retailIVR';
export { constructionIVRService, type ConstructionIVRData } from './industry/constructionIVR';

// Backend integrations
export * from './integrations';
