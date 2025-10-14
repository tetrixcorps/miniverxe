# 🚛 eSIM IoT Fleet Management Workflow Guide
**Complete Step-by-Step Guide for Fleet Manager Onboarding**

**Version:** 2.0  
**Date:** October 14, 2025  
**Target Audience:** Fleet Managers, IT Teams, Integration Developers

---

## 📋 **Executive Summary**

This comprehensive guide outlines the complete workflow for onboarding fleet management clients to TETRIX's eSIM IoT services. The process covers eSIM provisioning, QR code activation, telematics integration, and data ingestion into `iot.tetrixcorp.com`.

**Key Components:**
- **eSIM Ordering System** - QR code generation and activation
- **Telematics Integration** - OBD-II and GPS device integration
- **Data Ingestion Pipeline** - Real-time data processing and storage
- **Fleet Management Dashboard** - Monitoring and analytics platform

---

## 🏗️ **System Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Fleet Trucks  │    │   eSIM Cards    │    │   Telematics    │
│   (Hardware)    │    │   (QR Codes)    │    │   Devices       │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TETRIX IoT Platform                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   eSIM      │  │   Device    │  │   Data      │            │
│  │ Ordering    │  │ Management  │  │ Ingestion   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   QR Code   │  │   OBD-II    │  │   Real-time │            │
│  │ Activation  │  │ Integration │  │ Processing  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   iot.tetrixcorp.com │    │   Analytics    │    │   Fleet        │
│   (Data Storage)     │    │   Engine       │    │   Dashboard    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🎯 **Complete Onboarding Workflow**

### **Phase 1: Pre-Integration Setup (Week 1)**

#### **1.1 Client Assessment & Planning**
```bash
# Client Information Gathering
- Fleet size and vehicle types
- Current telematics systems
- Data requirements and KPIs
- Integration preferences
- Security and compliance needs
```

#### **1.2 Account Setup & API Credentials**
```bash
# TETRIX Account Creation
POST https://tetrixcorp.com/api/v1/accounts
{
  "companyName": "FleetCorp Inc",
  "fleetSize": 150,
  "industry": "logistics",
  "contactInfo": {
    "primaryContact": "John Smith",
    "email": "john@fleetcorp.com",
    "phone": "+1-555-0123"
  },
  "requirements": {
    "dataRetention": "2 years",
    "realTimeTracking": true,
    "predictiveMaintenance": true,
    "routeOptimization": true
  }
}

# API Key Generation
POST https://tetrixcorp.com/api/v1/auth/keys
{
  "accountId": "acc_123456",
  "permissions": ["fleet:read", "fleet:write", "analytics:read"],
  "expiresAt": "2026-10-14T00:00:00Z"
}
```

#### **1.3 Fleet Data Preparation**
```json
{
  "vehicles": [
    {
      "vehicleId": "VH_001",
      "make": "Ford",
      "model": "Transit",
      "year": 2023,
      "licensePlate": "ABC123",
      "vin": "1FTBW2CM5HKA12345",
      "driverId": "DRV_001"
    }
  ],
  "drivers": [
    {
      "driverId": "DRV_001",
      "name": "John Smith",
      "licenseNumber": "DL123456789",
      "phone": "+1-555-0123"
    }
  ]
}
```

---

### **Phase 2: eSIM Provisioning & QR Code Activation (Week 2)**

#### **2.1 eSIM Order Creation**
```bash
# Create eSIM Order
POST https://tetrixcorp.com/api/v1/esim/orders
{
  "accountId": "acc_123456",
  "fleetId": "fleet_001",
  "esimType": "industrial_iot",
  "dataPlan": "unlimited",
  "region": "north_america",
  "quantity": 150,
  "vehicleMapping": {
    "VH_001": "esim_001",
    "VH_002": "esim_002"
  }
}

# Response includes QR codes and activation details
{
  "orderId": "order_789012",
  "status": "processing",
  "esims": [
    {
      "esimId": "esim_001",
      "vehicleId": "VH_001",
      "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      "activationCode": "LPA:1$rsp-prod.ondemandconnectivity.com$...",
      "downloadUrl": "https://iot.tetrixcorp.com/esim/download/esim_001",
      "expiresAt": "2025-11-14T00:00:00Z"
    }
  ]
}
```

#### **2.2 QR Code Activation Process**
```bash
# Step 1: Generate QR Code for Device
POST https://iot.tetrixcorp.com/api/v1/esim/qr-generate
{
  "esimId": "esim_001",
  "vehicleId": "VH_001",
  "deviceType": "telematics_unit",
  "activationMethod": "qr_code"
}

# Step 2: Device Scans QR Code
# Device automatically connects to eSIM network
# Device receives configuration via OTA

# Step 3: Verify Activation
GET https://iot.tetrixcorp.com/api/v1/esim/status/esim_001
{
  "esimId": "esim_001",
  "status": "active",
  "network": "TETRIX_IOT_NETWORK",
  "signalStrength": 85,
  "dataUsage": "0 MB",
  "activatedAt": "2025-10-14T10:30:00Z"
}
```

---

### **Phase 3: Telematics Device Integration (Week 2-3)**

#### **3.1 OBD-II Device Installation**
```bash
# Physical Installation Steps
1. Locate OBD-II port (usually under dashboard)
2. Connect telematics device to OBD-II port
3. Power on device and verify LED indicators
4. Device automatically connects to eSIM network
5. Device registers with TETRIX platform
```

#### **3.2 Device Registration & Configuration**
```bash
# Device Auto-Registration
POST https://iot.tetrixcorp.com/api/v1/devices/register
{
  "deviceId": "TEL_001",
  "esimId": "esim_001",
  "vehicleId": "VH_001",
  "deviceType": "obd_ii_telematics",
  "firmwareVersion": "2.1.3",
  "capabilities": [
    "gps_tracking",
    "obd_data",
    "accelerometer",
    "gyroscope",
    "fuel_monitoring"
  ],
  "configuration": {
    "trackingInterval": 30,
    "dataTransmissionInterval": 60,
    "alertThresholds": {
      "speed": 80,
      "idleTime": 300,
      "fuelLevel": 10
    }
  }
}
```

#### **3.3 GPS & Sensor Calibration**
```bash
# GPS Calibration
POST https://iot.tetrixcorp.com/api/v1/devices/TEL_001/calibrate
{
  "calibrationType": "gps",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "accuracy": 5
  },
  "duration": 300
}

# OBD-II PID Configuration
POST https://iot.tetrixcorp.com/api/v1/devices/TEL_001/configure
{
  "obdPids": [
    "0105",  // Engine coolant temperature
    "010C",  // Engine RPM
    "010D",  // Vehicle speed
    "010F",  // Intake air temperature
    "0110",  // Mass air flow rate
    "0111",  // Throttle position
    "012F",  // Fuel tank level input
    "0133"   // Barometric pressure
  ],
  "transmissionRate": 30
}
```

---

### **Phase 4: Data Ingestion Pipeline (Week 3)**

#### **4.1 Real-Time Data Collection**
```bash
# Telemetry Data Format
POST https://iot.tetrixcorp.com/api/v1/telemetry/ingest
{
  "deviceId": "TEL_001",
  "vehicleId": "VH_001",
  "timestamp": "2025-10-14T10:30:00.000Z",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "altitude": 10,
    "accuracy": 5,
    "heading": 45,
    "speed": 35
  },
  "engineData": {
    "rpm": 2500,
    "fuelLevel": 75,
    "engineTemp": 190,
    "batteryVoltage": 12.4,
    "throttlePosition": 25
  },
  "driverBehavior": {
    "hardBraking": 0,
    "hardAcceleration": 0,
    "speeding": false,
    "idleTime": 0
  },
  "diagnostics": {
    "checkEngine": false,
    "absFault": false,
    "airbagFault": false
  }
}
```

#### **4.2 Data Processing & Storage**
```bash
# Data Processing Pipeline
1. Data Validation
   - Validate JSON schema
   - Check data ranges
   - Verify device authentication

2. Data Enrichment
   - Add geocoding information
   - Calculate derived metrics
   - Apply business rules

3. Data Storage
   - Store in time-series database
   - Update real-time cache
   - Archive historical data

4. Real-Time Processing
   - Generate alerts
   - Update dashboards
   - Trigger webhooks
```

#### **4.3 Webhook Configuration**
```bash
# Configure Real-Time Webhooks
POST https://iot.tetrixcorp.com/api/v1/webhooks/configure
{
  "accountId": "acc_123456",
  "webhooks": [
    {
      "eventType": "vehicle.location_update",
      "url": "https://fleetcorp.com/webhooks/location",
      "secret": "webhook_secret_123",
      "enabled": true
    },
    {
      "eventType": "vehicle.speed_alert",
      "url": "https://fleetcorp.com/webhooks/speed",
      "secret": "webhook_secret_123",
      "enabled": true
    },
    {
      "eventType": "maintenance.alert",
      "url": "https://fleetcorp.com/webhooks/maintenance",
      "secret": "webhook_secret_123",
      "enabled": true
    }
  ]
}
```

---

### **Phase 5: Fleet Management Dashboard Setup (Week 3-4)**

#### **5.1 Dashboard Configuration**
```bash
# Create Fleet Dashboard
POST https://iot.tetrixcorp.com/api/v1/dashboards/create
{
  "accountId": "acc_123456",
  "dashboardName": "FleetCorp Main Dashboard",
  "widgets": [
    {
      "type": "fleet_map",
      "title": "Real-Time Fleet Map",
      "position": { "x": 0, "y": 0, "w": 12, "h": 8 }
    },
    {
      "type": "vehicle_status",
      "title": "Vehicle Status Overview",
      "position": { "x": 0, "y": 8, "w": 6, "h": 4 }
    },
    {
      "type": "driver_performance",
      "title": "Driver Performance",
      "position": { "x": 6, "y": 8, "w": 6, "h": 4 }
    },
    {
      "type": "fuel_efficiency",
      "title": "Fuel Efficiency Metrics",
      "position": { "x": 0, "y": 12, "w": 12, "h": 4 }
    }
  ]
}
```

#### **5.2 User Access Management**
```bash
# Create User Accounts
POST https://iot.tetrixcorp.com/api/v1/users/create
{
  "accountId": "acc_123456",
  "users": [
    {
      "email": "fleet.manager@fleetcorp.com",
      "role": "fleet_manager",
      "permissions": ["fleet:read", "fleet:write", "analytics:read"]
    },
    {
      "email": "driver@fleetcorp.com",
      "role": "driver",
      "permissions": ["fleet:read"]
    }
  ]
}
```

---

## 🔧 **Technical Implementation Details**

### **eSIM Integration Architecture**

#### **QR Code Generation Process**
```javascript
// eSIM QR Code Generation
class ESIMQRGenerator {
  generateQRCode(esimData) {
    const qrData = {
      version: "1.0",
      type: "esim_activation",
      esimId: esimData.esimId,
      activationCode: esimData.activationCode,
      network: "TETRIX_IOT_NETWORK",
      serverUrl: "https://iot.tetrixcorp.com/api/v1/esim/activate",
      expiresAt: esimData.expiresAt
    };
    
    const qrString = `LPA:1$${qrData.serverUrl}$${qrData.activationCode}`;
    return this.generateQRImage(qrString);
  }
}
```

#### **Device Activation Workflow**
```javascript
// Device Activation Process
class DeviceActivation {
  async activateDevice(qrCodeData) {
    // 1. Parse QR code data
    const activationData = this.parseQRCode(qrCodeData);
    
    // 2. Connect to eSIM network
    const networkConnection = await this.connectToESIM(activationData);
    
    // 3. Download eSIM profile
    const esimProfile = await this.downloadESIMProfile(activationData);
    
    // 4. Install eSIM profile
    await this.installESIMProfile(esimProfile);
    
    // 5. Register with TETRIX platform
    const deviceRegistration = await this.registerDevice(activationData);
    
    return deviceRegistration;
  }
}
```

### **Telematics Data Collection**

#### **OBD-II Data Integration**
```javascript
// OBD-II Data Collection
class OBDIICollector {
  async collectEngineData(deviceId) {
    const obdPids = [
      '0105', // Engine coolant temperature
      '010C', // Engine RPM
      '010D', // Vehicle speed
      '010F', // Intake air temperature
      '0110', // Mass air flow rate
      '0111', // Throttle position
      '012F', // Fuel tank level input
      '0133'  // Barometric pressure
    ];
    
    const engineData = {};
    
    for (const pid of obdPids) {
      try {
        const value = await this.readOBDValue(deviceId, pid);
        engineData[pid] = this.parseOBDValue(pid, value);
      } catch (error) {
        console.error(`Failed to read PID ${pid}:`, error);
      }
    }
    
    return engineData;
  }
}
```

#### **GPS Data Collection**
```javascript
// GPS Data Collection
class GPSCollector {
  async collectLocationData(deviceId) {
    const gpsData = await this.getGPSFix(deviceId);
    
    return {
      latitude: gpsData.latitude,
      longitude: gpsData.longitude,
      altitude: gpsData.altitude,
      accuracy: gpsData.accuracy,
      heading: gpsData.heading,
      speed: gpsData.speed,
      timestamp: new Date().toISOString()
    };
  }
}
```

### **Data Ingestion Pipeline**

#### **Real-Time Data Processing**
```javascript
// Data Ingestion Service
class DataIngestionService {
  async processTelemetryData(deviceId, rawData) {
    // 1. Validate data
    const validatedData = await this.validateData(rawData);
    
    // 2. Enrich data
    const enrichedData = await this.enrichData(validatedData);
    
    // 3. Store data
    await this.storeData(deviceId, enrichedData);
    
    // 4. Process real-time alerts
    await this.processAlerts(deviceId, enrichedData);
    
    // 5. Update cache
    await this.updateCache(deviceId, enrichedData);
    
    // 6. Trigger webhooks
    await this.triggerWebhooks(deviceId, enrichedData);
  }
}
```

---

## 📊 **Fleet Management Dashboard**

### **Real-Time Monitoring**
```javascript
// Fleet Dashboard Components
class FleetDashboard {
  // Real-time fleet map
  renderFleetMap(vehicles) {
    return {
      type: 'map',
      data: vehicles.map(vehicle => ({
        id: vehicle.vehicleId,
        location: vehicle.location,
        status: vehicle.status,
        driver: vehicle.driverName,
        speed: vehicle.speed
      }))
    };
  }
  
  // Vehicle status overview
  renderVehicleStatus(vehicles) {
    const statusCounts = vehicles.reduce((acc, vehicle) => {
      acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
      return acc;
    }, {});
    
    return {
      total: vehicles.length,
      active: statusCounts.active || 0,
      idle: statusCounts.idle || 0,
      maintenance: statusCounts.maintenance || 0
    };
  }
  
  // Driver performance metrics
  renderDriverPerformance(drivers) {
    return drivers.map(driver => ({
      driverId: driver.driverId,
      name: driver.name,
      safetyScore: driver.safetyScore,
      efficiencyScore: driver.efficiencyScore,
      totalMiles: driver.totalMiles,
      incidents: driver.incidents
    }));
  }
}
```

---

## 🚀 **Deployment & Go-Live Process**

### **Phase 1: Pilot Deployment (Week 3)**
```bash
# Deploy to 5-10 vehicles
1. Install eSIM cards in pilot vehicles
2. Configure telematics devices
3. Test data collection and transmission
4. Validate dashboard functionality
5. Gather user feedback
```

### **Phase 2: Full Fleet Deployment (Week 4)**
```bash
# Deploy to entire fleet
1. Install eSIM cards in all vehicles
2. Configure all telematics devices
3. Train fleet managers and drivers
4. Monitor system performance
5. Go live with full functionality
```

---

## 📈 **Success Metrics & KPIs**

### **Technical Metrics**
- **Data Accuracy:** 99.9% GPS accuracy
- **System Uptime:** 99.9% availability
- **Data Latency:** < 30 seconds real-time updates
- **API Response Time:** < 100ms average

### **Business Metrics**
- **Fuel Efficiency:** 15% improvement
- **Route Optimization:** 20% time savings
- **Maintenance Costs:** 30% reduction
- **Driver Safety:** 25% improvement in safety scores

---

## 🛠️ **Troubleshooting Guide**

### **Common Issues & Solutions**

#### **eSIM Activation Issues**
```bash
# Problem: QR code not scanning
# Solution: Regenerate QR code with higher resolution
POST https://iot.tetrixcorp.com/api/v1/esim/qr-regenerate
{
  "esimId": "esim_001",
  "resolution": "high"
}

# Problem: eSIM not connecting to network
# Solution: Check network coverage and device compatibility
GET https://iot.tetrixcorp.com/api/v1/esim/network-status/esim_001
```

#### **Telematics Data Issues**
```bash
# Problem: No OBD-II data
# Solution: Check device connection and PID configuration
POST https://iot.tetrixcorp.com/api/v1/devices/TEL_001/diagnose
{
  "testType": "obd_connection"
}

# Problem: GPS accuracy issues
# Solution: Recalibrate GPS and check antenna
POST https://iot.tetrixcorp.com/api/v1/devices/TEL_001/calibrate
{
  "calibrationType": "gps",
  "duration": 600
}
```

---

## 📞 **Support & Resources**

### **Technical Support**
- **Email:** iot-support@tetrixcorp.com
- **Phone:** +1 (555) 123-4567
- **Slack:** #tetrix-iot-support
- **Documentation:** https://docs.tetrixcorp.com/iot

### **Integration Support**
- **Email:** iot-integrations@tetrixcorp.com
- **Phone:** +1 (555) 123-4568
- **Slack:** #tetrix-iot-integrations
- **API Docs:** https://api.tetrixcorp.com/iot/docs

---

## 🎯 **Next Steps**

1. **Complete Account Setup** - Register with TETRIX and obtain API credentials
2. **Order eSIM Cards** - Place order for fleet eSIM cards
3. **Install Telematics Devices** - Deploy OBD-II devices in vehicles
4. **Configure Dashboard** - Set up fleet management dashboard
5. **Train Users** - Conduct training for fleet managers and drivers
6. **Go Live** - Deploy full fleet management solution

---

*This guide provides a comprehensive workflow for onboarding fleet management clients to TETRIX's eSIM IoT services. For additional support, contact our IoT integration team at iot-integrations@tetrixcorp.com.*
