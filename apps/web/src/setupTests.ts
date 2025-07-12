import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Set API base URL for tests
// @ts-ignore
globalThis.__API_BASE_URL__ = 'http://localhost:4000';

// Mock TextEncoder and TextDecoder for Jest
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Mock @tetrix/rbac package
jest.mock('@tetrix/rbac', () => ({
  Roles: {
    Labeler: 'Labeler',
    Reviewer: 'Reviewer',
    CodingStudent: 'CodingStudent',
    SuperAdmin: 'SuperAdmin',
    ClientAdmin: 'ClientAdmin',
    DataAnalyst: 'DataAnalyst',
  },
  Permissions: {
    'task.assign': 'task.assign',
    'task.review': 'task.review',
    'course.enroll': 'course.enroll',
    'course.view': 'course.view',
    'org.create': 'org.create',
    'user.invite': 'user.invite',
    'api.access': 'api.access',
  },
})); 