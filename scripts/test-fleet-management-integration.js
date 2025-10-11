#!/usr/bin/env node

/**
 * TETRIX Fleet Management Integration Test Script
 * Comprehensive testing for fleet management APIs and services
 */

import https from 'https';
import http from 'http';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',

  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',

  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
};

class FleetManagementTester {
  constructor() {
    this.host = 'localhost';
    this.port = 8080;
    this.apiKey = 'test_api_key_12345';
    this.baseUrl = `http://${this.host}:${this.port}/api/v1/fleet`;
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      details: [],
    };
    this.testData = {
      vehicleId: 'TEST_VH_001',
      deviceId: 'TEST_DEVICE_001',
      driverId: 'TEST_DRIVER_001',
    };
  }

  log(message, type = 'info') {
    let prefix = '';
    switch (type) {
      case 'info':
        prefix = `${colors.blue}🔍${colors.reset}`;
        break;
      case 'success':
        prefix = `${colors.green}✅${colors.reset}`;
        break;
      case 'fail':
        prefix = `${colors.red}❌${colors.reset}`;
        break;
      case 'warn':
        prefix = `${colors.yellow}⚠️ ${colors.reset}`;
        break;
      case 'header':
        prefix = `${colors.bright}${colors.blue}🚛${colors.reset}`;
        break;
      case 'subheader':
        prefix = `${colors.bright}${colors.blue}📊${colors.reset}`;
        break;
    }
    console.log(`${prefix} ${message}`);
  }

  recordResult(testName, status, message = '') {
    this.results.total++;
    if (status === 'passed') {
      this.results.passed++;
      this.log(`${testName} (${status})`, 'success');
    } else if (status === 'failed') {
      this.results.failed++;
      this.log(`${testName} (${status})`, 'fail');
      if (message) {
        this.log(`   Response: ${message}`, 'fail');
      }
    } else if (status === 'skipped') {
      this.results.skipped++;
      this.log(`${testName} (${status})`, 'warn');
    }
    this.results.details.push({ testName, status, message });
  }

  makeHttpRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
      const client = options.port === 443 || options.protocol === 'https:' ? https : http;
      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, data }); // Return raw data if not JSON
          }
        });
      });

      req.on('error', (e) => reject(e));

      if (postData) {
        req.write(JSON.stringify(postData));
      }
      req.end();
    });
  }

  async testFleetAPIHealth() {
    this.log('\nTesting Fleet API Health...', 'info');
    try {
      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/fleet/health',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options);

      if (statusCode === 200 && data.status === 'healthy') {
        this.recordResult('Fleet API Health Check', 'passed', data);
      } else {
        this.recordResult('Fleet API Health Check', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('Fleet API Health Check', 'failed', error.message);
    }
  }

  async testDeviceRegistration() {
    this.log('\nTesting Device Registration...', 'info');
    try {
      const deviceData = {
        deviceId: this.testData.deviceId,
        vehicleId: this.testData.vehicleId,
        deviceType: 'gps_tracker',
        vehicleInfo: {
          make: 'Ford',
          model: 'Transit',
          year: 2023,
          licensePlate: 'TEST123',
          vin: '1FTBW2CM5HKA12345',
        },
        driverInfo: {
          driverId: this.testData.driverId,
          name: 'Test Driver',
          licenseNumber: 'DL123456789',
        },
        configuration: {
          trackingInterval: 30,
          alertThresholds: {
            speed: 80,
            idleTime: 300,
            fuelLevel: 10,
          },
        },
      };

      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/fleet/devices',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options, deviceData);

      if (statusCode === 200 || statusCode === 201) {
        this.recordResult('Device Registration', 'passed', data);
      } else {
        this.recordResult('Device Registration', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('Device Registration', 'failed', error.message);
    }
  }

  async testVehicleLocationTracking() {
    this.log('\nTesting Vehicle Location Tracking...', 'info');
    try {
      const options = {
        hostname: this.host,
        port: this.port,
        path: `/api/v1/fleet/vehicles/${this.testData.vehicleId}/location`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options);

      if (statusCode === 200 && data.location) {
        this.recordResult('Vehicle Location Tracking', 'passed', data);
      } else {
        this.recordResult('Vehicle Location Tracking', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('Vehicle Location Tracking', 'failed', error.message);
    }
  }

  async testTelemetryDataSubmission() {
    this.log('\nTesting Telemetry Data Submission...', 'info');
    try {
      const telemetryData = {
        deviceId: this.testData.deviceId,
        timestamp: new Date().toISOString(),
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 5,
          heading: 45,
          speed: 35,
        },
        engineData: {
          rpm: 2500,
          fuelLevel: 75,
          engineTemp: 190,
          batteryVoltage: 12.4,
        },
        driverBehavior: {
          hardBraking: 0,
          hardAcceleration: 0,
          speeding: false,
          idleTime: 0,
        },
        diagnostics: {
          checkEngine: false,
          absFault: false,
          airbagFault: false,
        },
      };

      const options = {
        hostname: this.host,
        port: this.port,
        path: `/api/v1/fleet/vehicles/${this.testData.vehicleId}/telemetry`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options, telemetryData);

      if (statusCode === 200 || statusCode === 201) {
        this.recordResult('Telemetry Data Submission', 'passed', data);
      } else {
        this.recordResult('Telemetry Data Submission', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('Telemetry Data Submission', 'failed', error.message);
    }
  }

  async testFleetAnalytics() {
    this.log('\nTesting Fleet Analytics...', 'info');
    try {
      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/fleet/analytics?period=monthly',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options);

      if (statusCode === 200 && data.analytics) {
        this.recordResult('Fleet Analytics', 'passed', data);
      } else {
        this.recordResult('Fleet Analytics', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('Fleet Analytics', 'failed', error.message);
    }
  }

  async testRouteOptimization() {
    this.log('\nTesting Route Optimization...', 'info');
    try {
      const routeData = {
        vehicles: [
          {
            vehicleId: this.testData.vehicleId,
            capacity: 1000,
            currentLocation: {
              latitude: 40.7128,
              longitude: -74.0060,
            },
          },
        ],
        stops: [
          {
            stopId: 'STOP_001',
            address: '123 Main St, New York, NY',
            latitude: 40.7589,
            longitude: -73.9851,
            timeWindow: {
              start: '09:00',
              end: '17:00',
            },
            serviceTime: 30,
            priority: 1,
          },
        ],
        constraints: {
          maxRouteTime: 480,
          maxStopsPerRoute: 20,
          considerTraffic: true,
        },
      };

      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/fleet/routes/optimize',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options, routeData);

      if (statusCode === 200 && data.optimizedRoutes) {
        this.recordResult('Route Optimization', 'passed', data);
      } else {
        this.recordResult('Route Optimization', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('Route Optimization', 'failed', error.message);
    }
  }

  async testDriverPerformance() {
    this.log('\nTesting Driver Performance...', 'info');
    try {
      const options = {
        hostname: this.host,
        port: this.port,
        path: `/api/v1/fleet/drivers/${this.testData.driverId}/performance`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options);

      if (statusCode === 200 && data.performance) {
        this.recordResult('Driver Performance', 'passed', data);
      } else {
        this.recordResult('Driver Performance', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('Driver Performance', 'failed', error.message);
    }
  }

  async testMaintenanceAlerts() {
    this.log('\nTesting Maintenance Alerts...', 'info');
    try {
      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/fleet/maintenance/alerts',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options);

      if (statusCode === 200 && data.alerts) {
        this.recordResult('Maintenance Alerts', 'passed', data);
      } else {
        this.recordResult('Maintenance Alerts', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('Maintenance Alerts', 'failed', error.message);
    }
  }

  async testGeofencing() {
    this.log('\nTesting Geofencing...', 'info');
    try {
      const geofenceData = {
        geofenceId: 'GEO_001',
        name: 'Test Geofence',
        type: 'circle',
        center: {
          latitude: 40.7128,
          longitude: -74.0060,
        },
        radius: 100,
        alertSettings: {
          enterAlert: true,
          exitAlert: true,
          dwellTime: 300,
        },
      };

      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/fleet/geofences',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options, geofenceData);

      if (statusCode === 200 || statusCode === 201) {
        this.recordResult('Geofencing', 'passed', data);
      } else {
        this.recordResult('Geofencing', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('Geofencing', 'failed', error.message);
    }
  }

  async testWebhookEndpoints() {
    this.log('\nTesting Webhook Endpoints...', 'info');
    try {
      const webhookData = {
        eventType: 'vehicle.location_update',
        vehicleId: this.testData.vehicleId,
        driverId: this.testData.driverId,
        data: {
          location: {
            latitude: 40.7128,
            longitude: -74.0060,
            speed: 35,
            heading: 45,
          },
          status: 'moving',
        },
        timestamp: new Date().toISOString(),
      };

      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/fleet/webhooks/events',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options, webhookData);

      if (statusCode === 200 || statusCode === 201) {
        this.recordResult('Webhook Endpoints', 'passed', data);
      } else {
        this.recordResult('Webhook Endpoints', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('Webhook Endpoints', 'failed', error.message);
    }
  }

  async testErrorHandling() {
    this.log('\nTesting Error Handling...', 'info');
    try {
      // Test invalid API key
      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/fleet/vehicles',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid_api_key',
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options);

      if (statusCode === 401) {
        this.recordResult('Error Handling - Invalid API Key', 'passed', data);
      } else {
        this.recordResult('Error Handling - Invalid API Key', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('Error Handling - Invalid API Key', 'failed', error.message);
    }
  }

  printSummary() {
    console.log(`\n${colors.bright}=== Fleet Management Test Summary ===${colors.reset}`);
    console.log(`Total Tests: ${this.results.total}`);
    console.log(`${colors.green}Passed: ${this.results.passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${this.results.failed}${colors.reset}`);
    console.log(`${colors.yellow}Skipped: ${this.results.skipped}${colors.reset}`);

    if (this.results.failed > 0) {
      console.log(`\n${colors.bright}${colors.red}Failed Tests Details:${colors.reset}`);
      this.results.details.forEach((detail) => {
        if (detail.status === 'failed') {
          this.log(`${detail.testName}: ${detail.message}`, 'fail');
        }
      });
      process.exit(1); // Exit with error code if tests failed
    } else {
      console.log(`\n${colors.bright}${colors.green}All fleet management tests passed!${colors.reset}`);
      process.exit(0);
    }
  }

  async runAllTests() {
    this.log(`${colors.bright}🚛 Starting TETRIX Fleet Management Integration Tests...${colors.reset}`);
    this.log('================================================================');

    await this.testFleetAPIHealth();
    await this.testDeviceRegistration();
    await this.testVehicleLocationTracking();
    await this.testTelemetryDataSubmission();
    await this.testFleetAnalytics();
    await this.testRouteOptimization();
    await this.testDriverPerformance();
    await this.testMaintenanceAlerts();
    await this.testGeofencing();
    await this.testWebhookEndpoints();
    await this.testErrorHandling();

    // Print Summary
    this.printSummary();
  }
}

// Run the tests
const tester = new FleetManagementTester();
tester.runAllTests().catch(console.error);

export default FleetManagementTester;
