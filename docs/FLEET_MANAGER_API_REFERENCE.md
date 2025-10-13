# 🚛 TETRIX Fleet Management API Reference
**Complete API Documentation for Fleet Managers**

**Version:** 2.0  
**Date:** January 10, 2025  
**Base URL:** `https://tetrixcorp.com/api/v1/fleet`

---

## 📋 **Table of Contents**

1. [Authentication](#authentication)
2. [Device Management](#device-management)
3. [Vehicle Tracking](#vehicle-tracking)
4. [Telemetry Data](#telemetry-data)
5. [Analytics & Reporting](#analytics--reporting)
6. [Route Optimization](#route-optimization)
7. [Driver Management](#driver-management)
8. [Maintenance & Alerts](#maintenance--alerts)
9. [Geofencing](#geofencing)
10. [Webhooks](#webhooks)
11. [Error Handling](#error-handling)
12. [Rate Limits](#rate-limits)

---

## 🔐 **Authentication**

All API requests require authentication via API key in the Authorization header:

```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

### **API Key Management**
- **Sandbox Key:** For testing and development
- **Production Key:** For live fleet operations
- **Key Rotation:** Recommended every 90 days
- **Scopes:** Configure based on required permissions

---

## 📱 **Device Management**

### **Register Device**
Register a new IoT device for fleet tracking.

**Endpoint:** `POST /devices`

**Request Body:**
```json
{
  "deviceId": "string",           // Unique device identifier
  "vehicleId": "string",          // Associated vehicle ID
  "deviceType": "string",         // Device type (gps_tracker, obd_reader, etc.)
  "vehicleInfo": {
    "make": "string",             // Vehicle manufacturer
    "model": "string",            // Vehicle model
    "year": "number",             // Vehicle year
    "licensePlate": "string",     // License plate number
    "vin": "string",              // Vehicle identification number
    "color": "string",            // Vehicle color
    "fuelType": "string"          // Fuel type (gasoline, diesel, electric)
  },
  "driverInfo": {
    "driverId": "string",         // Driver identifier
    "name": "string",             // Driver full name
    "licenseNumber": "string",    // Driver license number
    "phoneNumber": "string",      // Driver contact number
    "email": "string"             // Driver email address
  },
  "configuration": {
    "trackingInterval": "number", // GPS update interval in seconds
    "alertThresholds": {
      "speed": "number",          // Speed limit in mph
      "idleTime": "number",       // Idle time threshold in minutes
      "fuelLevel": "number",      // Low fuel threshold in percentage
      "engineTemp": "number"      // High engine temperature threshold
    },
    "geofences": ["string"],      // Associated geofence IDs
    "features": ["string"]        // Enabled features
  }
}
```

**Response:**
```json
{
  "success": true,
  "deviceId": "FLEET_001",
  "vehicleId": "VH_001",
  "status": "active",
  "createdAt": "2025-01-10T16:30:00.000Z",
  "configuration": {
    "trackingInterval": 30,
    "alertThresholds": {
      "speed": 80,
      "idleTime": 300,
      "fuelLevel": 10,
      "engineTemp": 220
    }
  }
}
```

### **Get Device**
Retrieve device information and status.

**Endpoint:** `GET /devices/{deviceId}`

**Response:**
```json
{
  "success": true,
  "deviceId": "FLEET_001",
  "vehicleId": "VH_001",
  "status": "active",
  "deviceType": "gps_tracker",
  "vehicleInfo": {
    "make": "Ford",
    "model": "Transit",
    "year": 2023,
    "licensePlate": "ABC123",
    "vin": "1FTBW2CM5HKA12345"
  },
  "driverInfo": {
    "driverId": "DRV_001",
    "name": "John Smith",
    "licenseNumber": "DL123456789"
  },
  "lastSeen": "2025-01-10T16:25:00.000Z",
  "batteryLevel": 85,
  "signalStrength": -65
}
```

### **Update Device**
Update device configuration and settings.

**Endpoint:** `PUT /devices/{deviceId}`

**Request Body:**
```json
{
  "configuration": {
    "trackingInterval": 60,
    "alertThresholds": {
      "speed": 75,
      "idleTime": 600,
      "fuelLevel": 15
    }
  },
  "status": "active"
}
```

### **List Devices**
Get all devices with optional filtering.

**Endpoint:** `GET /devices`

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `inactive`, `maintenance`)
- `vehicleType` (optional): Filter by vehicle type
- `driverId` (optional): Filter by driver ID
- `limit` (optional): Number of devices to return (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "devices": [
    {
      "deviceId": "FLEET_001",
      "vehicleId": "VH_001",
      "status": "active",
      "vehicleInfo": {
        "make": "Ford",
        "model": "Transit",
        "licensePlate": "ABC123"
      },
      "driverInfo": {
        "driverId": "DRV_001",
        "name": "John Smith"
      },
      "lastSeen": "2025-01-10T16:25:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

---

## 🚗 **Vehicle Tracking**

### **Get Vehicle Location**
Get real-time location of a specific vehicle.

**Endpoint:** `GET /vehicles/{vehicleId}/location`

**Response:**
```json
{
  "success": true,
  "vehicleId": "VH_001",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Main St, New York, NY 10001",
    "accuracy": 5,
    "heading": 45,
    "speed": 35,
    "altitude": 10
  },
  "timestamp": "2025-01-10T16:30:00.000Z",
  "status": "moving",
  "odometer": 125000
}
```

### **Get Fleet Locations**
Get real-time locations of all vehicles.

**Endpoint:** `GET /vehicles/locations`

**Query Parameters:**
- `status` (optional): Filter by status (`moving`, `idle`, `parked`)
- `geofence` (optional): Filter by geofence ID
- `limit` (optional): Number of vehicles to return

**Response:**
```json
{
  "success": true,
  "vehicles": [
    {
      "vehicleId": "VH_001",
      "location": {
        "latitude": 40.7128,
        "longitude": -74.0060,
        "address": "123 Main St, New York, NY"
      },
      "status": "moving",
      "speed": 35,
      "heading": 45,
      "timestamp": "2025-01-10T16:30:00.000Z"
    }
  ],
  "totalVehicles": 25,
  "activeVehicles": 20
}
```

### **Get Vehicle History**
Get historical location data for a vehicle.

**Endpoint:** `GET /vehicles/{vehicleId}/history`

**Query Parameters:**
- `startDate` (required): Start date in ISO format
- `endDate` (required): End date in ISO format
- `limit` (optional): Number of records to return (default: 1000)

**Response:**
```json
{
  "success": true,
  "vehicleId": "VH_001",
  "history": [
    {
      "timestamp": "2025-01-10T16:30:00.000Z",
      "location": {
        "latitude": 40.7128,
        "longitude": -74.0060,
        "speed": 35,
        "heading": 45
      },
      "status": "moving"
    }
  ],
  "totalRecords": 1000,
  "hasMore": true
}
```

---

## 📊 **Telemetry Data**

### **Send Telemetry Data**
Send telemetry data from IoT devices.

**Endpoint:** `POST /vehicles/{vehicleId}/telemetry`

**Request Body:**
```json
{
  "deviceId": "FLEET_001",
  "timestamp": "2025-01-10T16:30:00.000Z",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "accuracy": 5,
    "heading": 45,
    "speed": 35
  },
  "engineData": {
    "rpm": 2500,
    "fuelLevel": 75,
    "engineTemp": 190,
    "batteryVoltage": 12.4,
    "oilPressure": 45,
    "throttlePosition": 25
  },
  "driverBehavior": {
    "hardBraking": 0,
    "hardAcceleration": 0,
    "speeding": false,
    "idleTime": 0,
    "seatbelt": true,
    "phoneUse": false
  },
  "environmental": {
    "temperature": 22,
    "humidity": 45,
    "pressure": 1013,
    "weather": "clear"
  },
  "diagnostics": {
    "checkEngine": false,
    "absFault": false,
    "airbagFault": false,
    "tirePressure": [32, 31, 33, 32]
  }
}
```

### **Get Telemetry Data**
Retrieve historical telemetry data.

**Endpoint:** `GET /vehicles/{vehicleId}/telemetry`

**Query Parameters:**
- `startDate` (required): Start date in ISO format
- `endDate` (required): End date in ISO format
- `dataType` (optional): Type of data (`location`, `engine`, `driver`, `environmental`)
- `limit` (optional): Number of records to return (default: 1000)

**Response:**
```json
{
  "success": true,
  "vehicleId": "VH_001",
  "data": [
    {
      "timestamp": "2025-01-10T16:30:00.000Z",
      "location": {
        "latitude": 40.7128,
        "longitude": -74.0060,
        "speed": 35,
        "heading": 45
      },
      "engineData": {
        "rpm": 2500,
        "fuelLevel": 75,
        "engineTemp": 190
      },
      "driverBehavior": {
        "hardBraking": 0,
        "hardAcceleration": 0,
        "speeding": false
      }
    }
  ],
  "totalRecords": 1000,
  "hasMore": true
}
```

---

## 📈 **Analytics & Reporting**

### **Get Fleet Analytics**
Get comprehensive fleet analytics and insights.

**Endpoint:** `GET /analytics`

**Query Parameters:**
- `period` (required): Time period (`daily`, `weekly`, `monthly`, `yearly`)
- `startDate` (optional): Start date for custom period
- `endDate` (optional): End date for custom period
- `vehicleIds` (optional): Comma-separated list of vehicle IDs

**Response:**
```json
{
  "success": true,
  "period": "monthly",
  "analytics": {
    "fleetOverview": {
      "totalVehicles": 25,
      "activeVehicles": 20,
      "totalMiles": 125000,
      "averageSpeed": 45,
      "fuelEfficiency": 8.5,
      "totalFuelCost": 52500,
      "averageIdleTime": 120
    },
    "driverPerformance": {
      "averageScore": 85,
      "safetyScore": 90,
      "efficiencyScore": 80,
      "complianceScore": 95,
      "topDrivers": [
        {
          "driverId": "DRV_001",
          "name": "John Smith",
          "score": 95,
          "miles": 5000,
          "incidents": 0
        }
      ]
    },
    "maintenance": {
      "scheduledMaintenance": 5,
      "overdueMaintenance": 1,
      "predictiveAlerts": 3,
      "maintenanceCost": 15000,
      "averageRepairTime": 4.5
    },
    "fuelConsumption": {
      "totalGallons": 15000,
      "averageMPG": 8.5,
      "costPerGallon": 3.50,
      "totalCost": 52500,
      "savings": 7500
    },
    "safety": {
      "totalIncidents": 2,
      "speedingViolations": 5,
      "hardBrakingEvents": 12,
      "hardAccelerationEvents": 8,
      "safetyScore": 90
    }
  },
  "timestamp": "2025-01-10T16:30:00.000Z"
}
```

### **Get Custom Report**
Generate custom reports based on specific criteria.

**Endpoint:** `POST /reports/custom`

**Request Body:**
```json
{
  "reportType": "driver_performance",
  "parameters": {
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-01-31T23:59:59.999Z",
    "vehicleIds": ["VH_001", "VH_002"],
    "driverIds": ["DRV_001", "DRV_002"],
    "metrics": ["safety", "efficiency", "compliance"],
    "groupBy": "driver"
  },
  "format": "json"
}
```

**Response:**
```json
{
  "success": true,
  "reportId": "RPT_001",
  "reportType": "driver_performance",
  "status": "completed",
  "data": {
    "drivers": [
      {
        "driverId": "DRV_001",
        "name": "John Smith",
        "metrics": {
          "safety": 95,
          "efficiency": 88,
          "compliance": 100
        },
        "totalMiles": 5000,
        "incidents": 0
      }
    ]
  },
  "generatedAt": "2025-01-10T16:30:00.000Z"
}
```

---

## 🗺️ **Route Optimization**

### **Optimize Routes**
Optimize delivery routes for maximum efficiency.

**Endpoint:** `POST /routes/optimize`

**Request Body:**
```json
{
  "vehicles": [
    {
      "vehicleId": "VH_001",
      "capacity": 1000,
      "currentLocation": {
        "latitude": 40.7128,
        "longitude": -74.0060
      },
      "driverId": "DRV_001",
      "workingHours": {
        "start": "08:00",
        "end": "17:00"
      }
    }
  ],
  "stops": [
    {
      "stopId": "STOP_001",
      "address": "123 Main St, New York, NY",
      "latitude": 40.7589,
      "longitude": -73.9851,
      "timeWindow": {
        "start": "09:00",
        "end": "17:00"
      },
      "serviceTime": 30,
      "priority": 1,
      "requirements": ["delivery", "signature"]
    }
  ],
  "constraints": {
    "maxRouteTime": 480,
    "maxStopsPerRoute": 20,
    "considerTraffic": true,
    "considerWeather": true,
    "avoidTolls": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "optimizedRoutes": [
    {
      "routeId": "ROUTE_001",
      "vehicleId": "VH_001",
      "driverId": "DRV_001",
      "stops": [
        {
          "stopId": "STOP_001",
          "sequence": 1,
          "estimatedArrival": "2025-01-10T09:30:00.000Z",
          "estimatedDeparture": "2025-01-10T10:00:00.000Z",
          "distance": 5.2,
          "duration": 15
        }
      ],
      "totalDistance": 15.5,
      "totalTime": 45,
      "totalCost": 25.50,
      "efficiency": 92,
      "estimatedFuelCost": 8.50
    }
  ],
  "optimizationMetrics": {
    "totalDistance": 15.5,
    "totalTime": 45,
    "totalCost": 25.50,
    "efficiencyImprovement": 15,
    "fuelSavings": 2.5
  }
}
```

---

## 👨‍💼 **Driver Management**

### **Get Driver Performance**
Get detailed driver performance analytics.

**Endpoint:** `GET /drivers/{driverId}/performance`

**Query Parameters:**
- `period` (optional): Time period for analysis (`daily`, `weekly`, `monthly`)
- `startDate` (optional): Start date for custom period
- `endDate` (optional): End date for custom period

**Response:**
```json
{
  "success": true,
  "driverId": "DRV_001",
  "driverName": "John Smith",
  "performance": {
    "overallScore": 85,
    "safetyScore": 90,
    "efficiencyScore": 80,
    "complianceScore": 95,
    "fuelEfficiency": 8.5,
    "totalMiles": 5000,
    "totalHours": 200,
    "incidents": 0,
    "violations": 0
  },
  "behaviorMetrics": {
    "hardBraking": 2,
    "hardAcceleration": 1,
    "speedingEvents": 0,
    "idleTime": 120,
    "averageSpeed": 45,
    "seatbeltUsage": 100,
    "phoneUse": 0
  },
  "period": "monthly",
  "timestamp": "2025-01-10T16:30:00.000Z"
}
```

### **Get Driver List**
Get list of all drivers with basic information.

**Endpoint:** `GET /drivers`

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `inactive`)
- `limit` (optional): Number of drivers to return
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "success": true,
  "drivers": [
    {
      "driverId": "DRV_001",
      "name": "John Smith",
      "licenseNumber": "DL123456789",
      "phoneNumber": "+1234567890",
      "email": "john.smith@company.com",
      "status": "active",
      "hireDate": "2023-01-15T00:00:00.000Z",
      "performanceScore": 85
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

---

## 🔧 **Maintenance & Alerts**

### **Get Maintenance Alerts**
Get AI-powered predictive maintenance alerts.

**Endpoint:** `GET /maintenance/alerts`

**Query Parameters:**
- `severity` (optional): Filter by severity (`low`, `medium`, `high`, `critical`)
- `vehicleId` (optional): Filter by vehicle ID
- `status` (optional): Filter by status (`active`, `resolved`)

**Response:**
```json
{
  "success": true,
  "alerts": [
    {
      "alertId": "ALT_001",
      "vehicleId": "VH_001",
      "alertType": "predictive_maintenance",
      "severity": "medium",
      "component": "engine",
      "description": "Engine oil change recommended within 500 miles",
      "predictedFailureDate": "2025-01-25T00:00:00.000Z",
      "confidence": 85,
      "recommendedAction": "Schedule oil change",
      "estimatedCost": 75,
      "status": "active",
      "createdAt": "2025-01-10T16:30:00.000Z"
    }
  ],
  "totalAlerts": 5,
  "criticalAlerts": 1
}
```

### **Get Maintenance Schedule**
Get scheduled maintenance for vehicles.

**Endpoint:** `GET /maintenance/schedule`

**Query Parameters:**
- `vehicleId` (optional): Filter by vehicle ID
- `startDate` (optional): Start date for schedule
- `endDate` (optional): End date for schedule

**Response:**
```json
{
  "success": true,
  "schedule": [
    {
      "scheduleId": "SCH_001",
      "vehicleId": "VH_001",
      "maintenanceType": "oil_change",
      "scheduledDate": "2025-01-15T00:00:00.000Z",
      "estimatedDuration": 60,
      "estimatedCost": 75,
      "priority": "medium",
      "status": "scheduled"
    }
  ],
  "totalScheduled": 5
}
```

---

## 🗺️ **Geofencing**

### **Create Geofence**
Create a new geofence for monitoring.

**Endpoint:** `POST /geofences`

**Request Body:**
```json
{
  "geofenceId": "GEO_001",
  "name": "Main Office",
  "type": "polygon",
  "coordinates": [
    {
      "latitude": 40.7128,
      "longitude": -74.0060
    },
    {
      "latitude": 40.7138,
      "longitude": -74.0070
    }
  ],
  "radius": 100,
  "alertSettings": {
    "enterAlert": true,
    "exitAlert": true,
    "dwellTime": 300
  }
}
```

### **Get Geofences**
Get all geofences with their status.

**Endpoint:** `GET /geofences`

**Response:**
```json
{
  "success": true,
  "geofences": [
    {
      "geofenceId": "GEO_001",
      "name": "Main Office",
      "type": "polygon",
      "status": "active",
      "vehicleCount": 5,
      "lastActivity": "2025-01-10T16:25:00.000Z"
    }
  ],
  "totalGeofences": 10
}
```

---

## 🔔 **Webhooks**

### **Fleet Events Webhook**
Receives real-time fleet events and notifications.

**Endpoint:** `POST /webhooks/events`

**Supported Events:**
- `vehicle.location_update` - Vehicle location changed
- `vehicle.speed_alert` - Speed threshold exceeded
- `vehicle.geofence_enter` - Vehicle entered geofence
- `vehicle.geofence_exit` - Vehicle exited geofence
- `driver.behavior_alert` - Driver behavior violation
- `maintenance.alert` - Maintenance alert triggered
- `fuel.low_level` - Low fuel level alert

**Webhook Payload:**
```json
{
  "eventType": "vehicle.speed_alert",
  "vehicleId": "VH_001",
  "driverId": "DRV_001",
  "data": {
    "speed": 85,
    "speedLimit": 65,
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "123 Main St, New York, NY"
    },
    "timestamp": "2025-01-10T16:30:00.000Z"
  },
  "severity": "medium",
  "requiresAction": true
}
```

---

## ❌ **Error Handling**

### **Error Response Format**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid request parameters",
    "details": "The vehicleId parameter is required",
    "timestamp": "2025-01-10T16:30:00.000Z"
  }
}
```

### **Common Error Codes**
- `INVALID_API_KEY` - Invalid or missing API key
- `INVALID_REQUEST` - Invalid request parameters
- `VEHICLE_NOT_FOUND` - Vehicle not found
- `DEVICE_NOT_FOUND` - Device not found
- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded
- `INSUFFICIENT_PERMISSIONS` - Insufficient permissions
- `INTERNAL_ERROR` - Internal server error

---

## ⚡ **Rate Limits**

### **API Rate Limits**
- **Standard Tier:** 1,000 requests per hour
- **Professional Tier:** 10,000 requests per hour
- **Enterprise Tier:** 100,000 requests per hour

### **Rate Limit Headers**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1641234567
```

---

## 📞 **Support**

### **Technical Support**
- **Email:** fleet-support@tetrixcorp.com
- **Phone:** +1 (555) 123-4567
- **Hours:** 24/7 Enterprise Support

### **API Documentation**
- **Interactive Docs:** https://docs.tetrixcorp.com/fleet
- **Postman Collection:** Available for download
- **SDK Libraries:** JavaScript, Python, Java, C#

---

*This API reference is part of the TETRIX Fleet Management Platform. For additional support, contact our fleet integration team.*
