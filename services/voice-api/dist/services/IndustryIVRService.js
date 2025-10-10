"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndustryIVRService = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
class IndustryIVRService {
    constructor(prisma, redis) {
        this.industryConfigs = {
            construction: {
                industry: 'construction',
                features: [
                    'project_status_updates',
                    'safety_alerts',
                    'resource_management',
                    'billing_invoicing',
                    'client_communication',
                    'compliance_reporting'
                ],
                departments: [
                    'Project Management',
                    'Safety & Compliance',
                    'Resource Management',
                    'Billing & Finance',
                    'Client Services',
                    'Emergency Response'
                ],
                greetings: {
                    welcome: 'Thank you for calling. For project updates, press 1. For safety concerns, press 2. For billing questions, press 3. For general inquiries, press 0.',
                    emergency: 'This is an emergency line. Please state your emergency and location clearly.',
                    project: 'You have reached the project status line. Please enter your project number or say your project name.',
                    safety: 'You have reached the safety hotline. Please describe your safety concern.'
                },
                routingRules: {
                    emergency: { priority: 'high', department: 'Emergency Response', escalation: true },
                    safety: { priority: 'high', department: 'Safety & Compliance', escalation: true },
                    billing: { priority: 'medium', department: 'Billing & Finance', escalation: false },
                    project: { priority: 'medium', department: 'Project Management', escalation: false }
                },
                integrations: ['project_management', 'safety_systems', 'billing_systems', 'crm'],
                pricing: {
                    basePrice: 79,
                    perMinuteRate: 0.08,
                    includedMinutes: 2000,
                    features: {
                        project_tracking: 0,
                        safety_alerts: 0,
                        resource_management: 0,
                        compliance_reporting: 25
                    }
                }
            },
            logistics: {
                industry: 'logistics',
                features: [
                    'real_time_tracking',
                    'driver_communication',
                    'delivery_management',
                    'exception_handling',
                    'fleet_analytics',
                    'customer_notifications'
                ],
                departments: [
                    'Dispatch',
                    'Driver Support',
                    'Customer Service',
                    'Fleet Management',
                    'Exception Handling',
                    'Analytics'
                ],
                greetings: {
                    welcome: 'Thank you for calling. For shipment tracking, press 1. For driver support, press 2. For delivery issues, press 3. For fleet management, press 4.',
                    tracking: 'Please enter your tracking number or say your tracking number.',
                    driver: 'You have reached driver support. Please state your driver ID and issue.',
                    delivery: 'You have reached delivery services. Please describe your delivery concern.'
                },
                routingRules: {
                    tracking: { priority: 'medium', department: 'Customer Service', escalation: false },
                    driver: { priority: 'high', department: 'Driver Support', escalation: true },
                    delivery: { priority: 'high', department: 'Exception Handling', escalation: true },
                    fleet: { priority: 'medium', department: 'Fleet Management', escalation: false }
                },
                integrations: ['fleet_management', 'tracking_systems', 'driver_apps', 'crm'],
                pricing: {
                    basePrice: 99,
                    perMinuteRate: 0.06,
                    includedMinutes: 3000,
                    features: {
                        real_time_tracking: 0,
                        driver_communication: 0,
                        delivery_management: 0,
                        fleet_analytics: 30
                    }
                }
            },
            healthcare: {
                industry: 'healthcare',
                features: [
                    'appointment_scheduling',
                    'patient_communication',
                    'emergency_triage',
                    'prescription_management',
                    'insurance_verification',
                    'compliance_reporting'
                ],
                departments: [
                    'Appointments',
                    'Emergency Triage',
                    'Patient Services',
                    'Insurance',
                    'Pharmacy',
                    'Administration'
                ],
                greetings: {
                    welcome: 'Thank you for calling. For appointments, press 1. For emergencies, press 2. For prescription refills, press 3. For insurance questions, press 4.',
                    emergency: 'This is an emergency line. Please state your emergency clearly.',
                    appointment: 'You have reached appointment scheduling. Please provide your patient information.',
                    prescription: 'You have reached the pharmacy. Please provide your prescription information.'
                },
                routingRules: {
                    emergency: { priority: 'critical', department: 'Emergency Triage', escalation: true },
                    appointment: { priority: 'medium', department: 'Appointments', escalation: false },
                    prescription: { priority: 'medium', department: 'Pharmacy', escalation: false },
                    insurance: { priority: 'low', department: 'Insurance', escalation: false }
                },
                integrations: ['emr_systems', 'appointment_systems', 'pharmacy_systems', 'insurance_systems'],
                pricing: {
                    basePrice: 149,
                    perMinuteRate: 0.12,
                    includedMinutes: 1500,
                    features: {
                        appointment_scheduling: 0,
                        emergency_triage: 0,
                        prescription_management: 0,
                        compliance_reporting: 50
                    }
                }
            },
            government: {
                industry: 'government',
                features: [
                    'citizen_services',
                    'emergency_services',
                    'permit_management',
                    'public_information',
                    'complaint_handling',
                    'compliance_monitoring'
                ],
                departments: [
                    'Citizen Services',
                    'Emergency Services',
                    'Permits & Licenses',
                    'Public Information',
                    'Complaints',
                    'Administration'
                ],
                greetings: {
                    welcome: 'Thank you for calling. For citizen services, press 1. For emergencies, press 2. For permits and licenses, press 3. For public information, press 4.',
                    emergency: 'This is an emergency line. Please state your emergency and location.',
                    citizen: 'You have reached citizen services. How may we assist you today?',
                    permits: 'You have reached permits and licenses. Please provide your permit number or application ID.'
                },
                routingRules: {
                    emergency: { priority: 'critical', department: 'Emergency Services', escalation: true },
                    citizen: { priority: 'medium', department: 'Citizen Services', escalation: false },
                    permits: { priority: 'medium', department: 'Permits & Licenses', escalation: false },
                    information: { priority: 'low', department: 'Public Information', escalation: false }
                },
                integrations: ['citizen_portals', 'emergency_systems', 'permit_systems', 'crm'],
                pricing: {
                    basePrice: 199,
                    perMinuteRate: 0.10,
                    includedMinutes: 2500,
                    features: {
                        citizen_services: 0,
                        emergency_services: 0,
                        permit_management: 0,
                        compliance_monitoring: 75
                    }
                }
            },
            education: {
                industry: 'education',
                features: [
                    'student_services',
                    'parent_communication',
                    'emergency_notifications',
                    'enrollment_management',
                    'academic_support',
                    'campus_services'
                ],
                departments: [
                    'Student Services',
                    'Parent Communication',
                    'Emergency Notifications',
                    'Enrollment',
                    'Academic Support',
                    'Campus Services'
                ],
                greetings: {
                    welcome: 'Thank you for calling. For student services, press 1. For parent inquiries, press 2. For emergencies, press 3. For enrollment, press 4.',
                    emergency: 'This is an emergency line. Please state your emergency and location.',
                    student: 'You have reached student services. Please provide your student ID.',
                    parent: 'You have reached parent services. Please provide your student\'s information.'
                },
                routingRules: {
                    emergency: { priority: 'critical', department: 'Emergency Notifications', escalation: true },
                    student: { priority: 'medium', department: 'Student Services', escalation: false },
                    parent: { priority: 'medium', department: 'Parent Communication', escalation: false },
                    enrollment: { priority: 'low', department: 'Enrollment', escalation: false }
                },
                integrations: ['student_information_systems', 'parent_portals', 'emergency_systems', 'crm'],
                pricing: {
                    basePrice: 89,
                    perMinuteRate: 0.07,
                    includedMinutes: 1800,
                    features: {
                        student_services: 0,
                        parent_communication: 0,
                        emergency_notifications: 0,
                        campus_services: 20
                    }
                }
            },
            retail: {
                industry: 'retail',
                features: [
                    'customer_service',
                    'order_management',
                    'inventory_inquiries',
                    'returns_exchanges',
                    'loyalty_program',
                    'store_locations'
                ],
                departments: [
                    'Customer Service',
                    'Order Management',
                    'Inventory',
                    'Returns & Exchanges',
                    'Loyalty Program',
                    'Store Information'
                ],
                greetings: {
                    welcome: 'Thank you for calling. For customer service, press 1. For order inquiries, press 2. For returns, press 3. For store information, press 4.',
                    customer: 'You have reached customer service. How may we assist you today?',
                    order: 'You have reached order management. Please provide your order number.',
                    returns: 'You have reached returns and exchanges. Please provide your return information.'
                },
                routingRules: {
                    customer: { priority: 'medium', department: 'Customer Service', escalation: false },
                    order: { priority: 'medium', department: 'Order Management', escalation: false },
                    returns: { priority: 'medium', department: 'Returns & Exchanges', escalation: false },
                    store: { priority: 'low', department: 'Store Information', escalation: false }
                },
                integrations: ['pos_systems', 'inventory_management', 'loyalty_programs', 'crm'],
                pricing: {
                    basePrice: 69,
                    perMinuteRate: 0.05,
                    includedMinutes: 2500,
                    features: {
                        customer_service: 0,
                        order_management: 0,
                        inventory_inquiries: 0,
                        loyalty_program: 15
                    }
                }
            },
            hospitality: {
                industry: 'hospitality',
                features: [
                    'reservation_management',
                    'guest_services',
                    'concierge_services',
                    'room_service',
                    'event_management',
                    'loyalty_program'
                ],
                departments: [
                    'Reservations',
                    'Guest Services',
                    'Concierge',
                    'Room Service',
                    'Events',
                    'Loyalty Program'
                ],
                greetings: {
                    welcome: 'Thank you for calling. For reservations, press 1. For guest services, press 2. For concierge, press 3. For room service, press 4.',
                    reservation: 'You have reached reservations. How may we assist you with your booking?',
                    guest: 'You have reached guest services. How may we make your stay more comfortable?',
                    concierge: 'You have reached concierge services. How may we assist you today?'
                },
                routingRules: {
                    reservation: { priority: 'high', department: 'Reservations', escalation: false },
                    guest: { priority: 'high', department: 'Guest Services', escalation: false },
                    concierge: { priority: 'medium', department: 'Concierge', escalation: false },
                    room_service: { priority: 'medium', department: 'Room Service', escalation: false }
                },
                integrations: ['property_management', 'reservation_systems', 'loyalty_programs', 'crm'],
                pricing: {
                    basePrice: 119,
                    perMinuteRate: 0.09,
                    includedMinutes: 2000,
                    features: {
                        reservation_management: 0,
                        guest_services: 0,
                        concierge_services: 0,
                        event_management: 40
                    }
                }
            },
            wellness: {
                industry: 'wellness',
                features: [
                    'appointment_scheduling',
                    'wellness_coaching',
                    'health_assessments',
                    'program_enrollment',
                    'member_services',
                    'emergency_contact'
                ],
                departments: [
                    'Appointments',
                    'Wellness Coaching',
                    'Health Assessments',
                    'Program Enrollment',
                    'Member Services',
                    'Emergency Contact'
                ],
                greetings: {
                    welcome: 'Thank you for calling. For appointments, press 1. For wellness coaching, press 2. For health assessments, press 3. For member services, press 4.',
                    appointment: 'You have reached appointment scheduling. Please provide your member information.',
                    coaching: 'You have reached wellness coaching. How may we support your wellness journey?',
                    assessment: 'You have reached health assessments. Please provide your assessment information.'
                },
                routingRules: {
                    appointment: { priority: 'medium', department: 'Appointments', escalation: false },
                    coaching: { priority: 'medium', department: 'Wellness Coaching', escalation: false },
                    assessment: { priority: 'medium', department: 'Health Assessments', escalation: false },
                    member: { priority: 'low', department: 'Member Services', escalation: false }
                },
                integrations: ['wellness_platforms', 'appointment_systems', 'health_records', 'crm'],
                pricing: {
                    basePrice: 79,
                    perMinuteRate: 0.08,
                    includedMinutes: 1500,
                    features: {
                        appointment_scheduling: 0,
                        wellness_coaching: 0,
                        health_assessments: 0,
                        program_enrollment: 25
                    }
                }
            },
            beauty: {
                industry: 'beauty',
                features: [
                    'appointment_scheduling',
                    'service_inquiries',
                    'product_consultation',
                    'loyalty_program',
                    'special_offers',
                    'customer_feedback'
                ],
                departments: [
                    'Appointments',
                    'Service Inquiries',
                    'Product Consultation',
                    'Loyalty Program',
                    'Special Offers',
                    'Customer Feedback'
                ],
                greetings: {
                    welcome: 'Thank you for calling. For appointments, press 1. For service inquiries, press 2. For product consultation, press 3. For special offers, press 4.',
                    appointment: 'You have reached appointment scheduling. Please provide your preferred service and date.',
                    service: 'You have reached service inquiries. How may we help you with our services?',
                    product: 'You have reached product consultation. Please describe your beauty needs.'
                },
                routingRules: {
                    appointment: { priority: 'high', department: 'Appointments', escalation: false },
                    service: { priority: 'medium', department: 'Service Inquiries', escalation: false },
                    product: { priority: 'medium', department: 'Product Consultation', escalation: false },
                    loyalty: { priority: 'low', department: 'Loyalty Program', escalation: false }
                },
                integrations: ['appointment_systems', 'inventory_management', 'loyalty_programs', 'crm'],
                pricing: {
                    basePrice: 59,
                    perMinuteRate: 0.06,
                    includedMinutes: 2000,
                    features: {
                        appointment_scheduling: 0,
                        service_inquiries: 0,
                        product_consultation: 0,
                        loyalty_program: 20
                    }
                }
            }
        };
        this.prisma = prisma;
        this.redis = redis;
    }
    async getIndustryConfig(industry) {
        try {
            const config = this.industryConfigs[industry.toLowerCase()];
            if (!config) {
                logger_1.default.warn(`Industry configuration not found: ${industry}`);
                return null;
            }
            return config;
        }
        catch (error) {
            logger_1.default.error('Error getting industry configuration:', error);
            return null;
        }
    }
    async getAllIndustries() {
        return Object.keys(this.industryConfigs);
    }
    async createIndustryTenant(industry, tenantData) {
        try {
            const config = await this.getIndustryConfig(industry);
            if (!config) {
                return { success: false, error: 'Invalid industry' };
            }
            const tenant = await this.prisma.tenant.create({
                data: {
                    name: tenantData.name,
                    industry: industry,
                    configuration: {
                        features: config.features,
                        departments: config.departments,
                        greetings: config.greetings,
                        routingRules: config.routingRules,
                        integrations: config.integrations,
                        pricing: config.pricing
                    },
                    status: 'active'
                }
            });
            for (const department of config.departments) {
                await this.prisma.department.create({
                    data: {
                        tenantId: tenant.id,
                        name: department,
                        description: `${department} department for ${industry} industry`,
                        phoneNumber: tenantData.phoneNumbers?.[department] || null,
                        businessHours: config.routingRules[department.toLowerCase()]?.businessHours || '9-5',
                        priority: config.routingRules[department.toLowerCase()]?.priority || 'medium'
                    }
                });
            }
            logger_1.default.info(`Created ${industry} tenant: ${tenant.id}`);
            return { success: true, tenantId: tenant.id };
        }
        catch (error) {
            logger_1.default.error('Error creating industry tenant:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async updateIndustryConfiguration(tenantId, industry, updates) {
        try {
            const config = await this.getIndustryConfig(industry);
            if (!config) {
                return { success: false, error: 'Invalid industry' };
            }
            await this.prisma.tenant.update({
                where: { id: tenantId },
                data: {
                    configuration: {
                        ...config,
                        ...updates
                    }
                }
            });
            logger_1.default.info(`Updated ${industry} configuration for tenant: ${tenantId}`);
            return { success: true };
        }
        catch (error) {
            logger_1.default.error('Error updating industry configuration:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async getIndustryPricing(industry) {
        try {
            const config = await this.getIndustryConfig(industry);
            if (!config) {
                return null;
            }
            return {
                industry: industry,
                basePrice: config.pricing.basePrice,
                perMinuteRate: config.pricing.perMinuteRate,
                includedMinutes: config.pricing.includedMinutes,
                features: config.pricing.features,
                currency: 'USD'
            };
        }
        catch (error) {
            logger_1.default.error('Error getting industry pricing:', error);
            return null;
        }
    }
    async calculateIndustryCost(industry, minutes, features) {
        try {
            const config = await this.getIndustryConfig(industry);
            if (!config) {
                return null;
            }
            const baseCost = config.pricing.basePrice;
            const includedMinutes = config.pricing.includedMinutes;
            const perMinuteRate = config.pricing.perMinuteRate;
            const additionalMinutes = Math.max(0, minutes - includedMinutes);
            const minuteCost = additionalMinutes * perMinuteRate;
            const featureCost = features.reduce((total, feature) => {
                return total + (config.pricing.features[feature] || 0);
            }, 0);
            const totalCost = baseCost + minuteCost + featureCost;
            return {
                industry: industry,
                baseCost: baseCost,
                minuteCost: minuteCost,
                featureCost: featureCost,
                totalCost: totalCost,
                breakdown: {
                    basePrice: baseCost,
                    additionalMinutes: additionalMinutes,
                    minuteRate: perMinuteRate,
                    features: features.map(f => ({
                        feature: f,
                        cost: config.pricing.features[f] || 0
                    }))
                }
            };
        }
        catch (error) {
            logger_1.default.error('Error calculating industry cost:', error);
            return null;
        }
    }
}
exports.IndustryIVRService = IndustryIVRService;
//# sourceMappingURL=IndustryIVRService.js.map