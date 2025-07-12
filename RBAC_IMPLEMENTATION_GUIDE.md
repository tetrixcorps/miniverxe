# Tetrix RBAC Implementation Guide

## Overview

This document outlines the comprehensive implementation of Role-Based Access Control (RBAC) using the `@tetrix/rbac` workspace package for the Tetrix platform. The system supports three main user groups:

1. **Data Annotators** - Data labeling service users
2. **Code Academy** - Educational platform users  
3. **Enterprise Clients** - Business customers (to be implemented)

## Current RBAC Architecture

### Core Components

#### 1. Roles (`packages/rbac/roles.ts`)
```typescript
export const Roles = {
  TaskAdmin: 'TaskAdmin',        // Data labeling admin
  Reviewer: 'Reviewer',          // QA reviewer
  Labeler: 'Labeler',            // Data labeler
  BillingAdmin: 'BillingAdmin',  // Billing management
  Owner: 'Owner',                // Organization owner
  CodingStudent: 'CodingStudent', // Academy student
  AcademyReviewer: 'AcademyReviewer', // Academy instructor
  SuperAdmin: 'SuperAdmin',      // Platform super admin
} as const;
```

#### 2. Permissions (`packages/rbac/permissions.ts`)
```typescript
export const Permissions = {
  AssignTask: 'task.assign',
  ReviewTask: 'task.review',
  AdminContactRead: 'admin:contact:read',
  AdminContactUpdate: 'admin:contact:update',
  AdminLogout: 'admin:logout',
  UserList: 'user:list',
  UserRead: 'user:read',
  UserUpdate: 'user:update',
  UserRoleUpdate: 'user:role:update',
  ProjectRead: 'project:read',
} as const;
```

## Enhanced RBAC Implementation

### 1. Extended Role Definitions

#### Data Annotators Module
```typescript
// packages/rbac/roles.ts - Extended
export const DataAnnotatorRoles = {
  ProjectManager: 'ProjectManager',     // Manage labeling projects
  SeniorLabeler: 'SeniorLabeler',       // Advanced labeling tasks
  JuniorLabeler: 'JuniorLabeler',       // Basic labeling tasks
  QualityAssurance: 'QualityAssurance', // QA specialist
  DataScientist: 'DataScientist',       // ML model training
} as const;

export const AcademyRoles = {
  Student: 'Student',                   // Basic student
  AdvancedStudent: 'AdvancedStudent',   // Advanced coursework
  TeachingAssistant: 'TeachingAssistant', // Help other students
  Instructor: 'Instructor',             // Course instructor
  CurriculumManager: 'CurriculumManager', // Manage course content
} as const;

export const EnterpriseRoles = {
  ClientAdmin: 'ClientAdmin',           // Enterprise admin
  ClientUser: 'ClientUser',             // Regular enterprise user
  ClientViewer: 'ClientViewer',         // Read-only access
  IntegrationManager: 'IntegrationManager', // API integration
} as const;
```

#### 2. Extended Permissions

```typescript
// packages/rbac/permissions.ts - Extended
export const DataAnnotatorPermissions = {
  // Project Management
  ProjectCreate: 'project:create',
  ProjectUpdate: 'project:update',
  ProjectDelete: 'project:delete',
  ProjectAssign: 'project:assign',
  
  // Task Management
  TaskCreate: 'task:create',
  TaskAssign: 'task:assign',
  TaskSubmit: 'task:submit',
  TaskReview: 'task:review',
  TaskApprove: 'task:approve',
  TaskReject: 'task:reject',
  
  // Data Management
  DatasetUpload: 'dataset:upload',
  DatasetDownload: 'dataset:download',
  DatasetAnnotate: 'dataset:annotate',
  
  // Quality Control
  QualityReview: 'quality:review',
  QualityApprove: 'quality:approve',
  QualityMetrics: 'quality:metrics',
  
  // Billing & Analytics
  BillingView: 'billing:view',
  BillingManage: 'billing:manage',
  AnalyticsView: 'analytics:view',
  AnalyticsExport: 'analytics:export',
} as const;

export const AcademyPermissions = {
  // Course Management
  CourseEnroll: 'course:enroll',
  CourseView: 'course:view',
  CourseSubmit: 'course:submit',
  CourseGrade: 'course:grade',
  
  // Assignment Management
  AssignmentSubmit: 'assignment:submit',
  AssignmentReview: 'assignment:review',
  AssignmentGrade: 'assignment:grade',
  
  // Learning Resources
  ResourceAccess: 'resource:access',
  ResourceCreate: 'resource:create',
  ResourceShare: 'resource:share',
  
  // Progress Tracking
  ProgressView: 'progress:view',
  ProgressUpdate: 'progress:update',
  CertificateGenerate: 'certificate:generate',
} as const;

export const EnterprisePermissions = {
  // Organization Management
  OrgCreate: 'org:create',
  OrgUpdate: 'org:update',
  OrgDelete: 'org:delete',
  OrgView: 'org:view',
  
  // User Management
  UserInvite: 'user:invite',
  UserRemove: 'user:remove',
  UserRoleAssign: 'user:role:assign',
  
  // API Access
  ApiAccess: 'api:access',
  ApiKeyManage: 'api:key:manage',
  ApiRateLimit: 'api:rate:limit',
  
  // Integration
  IntegrationCreate: 'integration:create',
  IntegrationUpdate: 'integration:update',
  IntegrationDelete: 'integration:delete',
  
  // Reporting
  ReportGenerate: 'report:generate',
  ReportSchedule: 'report:schedule',
  ReportExport: 'report:export',
} as const;
```

### 3. Role-Permission Mapping

```typescript
// packages/rbac/rolePermissions.ts
export const RolePermissionMap = {
  // Data Annotators
  [Roles.TaskAdmin]: [
    Permissions.ProjectCreate,
    Permissions.ProjectUpdate,
    Permissions.ProjectDelete,
    Permissions.TaskAssign,
    Permissions.TaskReview,
    Permissions.QualityReview,
    Permissions.BillingView,
    Permissions.AnalyticsView,
  ],
  
  [Roles.Reviewer]: [
    Permissions.TaskReview,
    Permissions.TaskApprove,
    Permissions.TaskReject,
    Permissions.QualityReview,
    Permissions.QualityMetrics,
  ],
  
  [Roles.Labeler]: [
    Permissions.TaskSubmit,
    Permissions.DatasetAnnotate,
    Permissions.ProgressView,
  ],
  
  [Roles.BillingAdmin]: [
    Permissions.BillingView,
    Permissions.BillingManage,
    Permissions.AnalyticsView,
    Permissions.AnalyticsExport,
  ],
  
  // Academy
  [Roles.CodingStudent]: [
    Permissions.CourseEnroll,
    Permissions.CourseView,
    Permissions.AssignmentSubmit,
    Permissions.ResourceAccess,
    Permissions.ProgressView,
  ],
  
  [Roles.AcademyReviewer]: [
    Permissions.AssignmentReview,
    Permissions.AssignmentGrade,
    Permissions.CourseGrade,
    Permissions.CertificateGenerate,
  ],
  
  // Enterprise
  [Roles.SuperAdmin]: [
    // All permissions
    ...Object.values(Permissions),
    ...Object.values(DataAnnotatorPermissions),
    ...Object.values(AcademyPermissions),
    ...Object.values(EnterprisePermissions),
  ],
} as const;
```

## Authentication & Authorization Implementation

### 1. Firebase Authentication Integration

```typescript
// apps/api/src/middleware/auth.ts - Enhanced
export interface AuthUser {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
  organizationId?: string;
  userGroup: 'data-annotator' | 'academy' | 'enterprise';
  metadata: {
    subscriptionTier?: string;
    rateLimit?: number;
    features?: string[];
  };
}

export async function firebaseAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    
    // Fetch user details from database
    const userDetails = await getUserDetails(decoded.uid);
    
    req.user = {
      id: decoded.uid,
      email: decoded.email || '',
      roles: decoded.roles || [],
      permissions: decoded.permissions || [],
      organizationId: userDetails?.organizationId,
      userGroup: userDetails?.userGroup || 'data-annotator',
      metadata: userDetails?.metadata || {},
    };
    
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
```

### 2. Enhanced RBAC Middleware

```typescript
// apps/api/src/middleware/rbac.ts - Enhanced
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const perms = Array.isArray(req.user.permissions)
      ? req.user.permissions.map(String)
      : [];
      
    if (!perms.includes(permission)) {
      return res.status(403).json({ 
        error: 'Forbidden: missing permission ' + permission,
        required: permission,
        userPermissions: perms
      });
    }
    
    next();
  };
}

export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const userRoles = Array.isArray(req.user.roles)
      ? req.user.roles.map(String)
      : [];
      
    if (!userRoles.includes(role)) {
      return res.status(403).json({ 
        error: 'Forbidden: missing role ' + role,
        required: role,
        userRoles: userRoles
      });
    }
    
    next();
  };
}

export function requireUserGroup(userGroup: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (req.user.userGroup !== userGroup) {
      return res.status(403).json({ 
        error: 'Forbidden: wrong user group',
        required: userGroup,
        userGroup: req.user.userGroup
      });
    }
    
    next();
  };
}
```

## Rate Limiting Implementation

### 1. Rate Limiting Middleware

```typescript
// apps/api/src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Base rate limiter
export const baseRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

// User-specific rate limiter
export const userRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 15 * 60 * 1000,
  max: (req) => {
    // Customize limits based on user group and subscription
    const user = req.user;
    if (!user) return 50; // Default for unauthenticated
    
    switch (user.userGroup) {
      case 'enterprise':
        return user.metadata?.rateLimit || 1000;
      case 'academy':
        return 200;
      case 'data-annotator':
        return 500;
      default:
        return 100;
    }
  },
  keyGenerator: (req) => req.user?.id || req.ip,
  message: 'Rate limit exceeded for this user',
});

// API-specific rate limiter
export const apiRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 60 * 1000, // 1 minute
  max: (req) => {
    const user = req.user;
    if (!user) return 10;
    
    // API calls are more expensive
    switch (user.userGroup) {
      case 'enterprise':
        return user.metadata?.apiRateLimit || 100;
      case 'academy':
        return 20;
      case 'data-annotator':
        return 50;
      default:
        return 10;
    }
  },
  keyGenerator: (req) => req.user?.id || req.ip,
  message: 'API rate limit exceeded',
});
```

### 2. Route-Specific Rate Limiting

```typescript
// apps/api/src/routes/data-annotator.ts
import { baseRateLimiter, userRateLimiter } from '../middleware/rateLimit';
import { requireUserGroup } from '../middleware/rbac';

const router = Router();

// Apply rate limiting to all data annotator routes
router.use(baseRateLimiter);
router.use(userRateLimiter);
router.use(requireUserGroup('data-annotator'));

// Task submission with specific rate limits
router.post('/tasks/:id/submit', 
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // Max 10 submissions per 5 minutes
    keyGenerator: (req) => req.user?.id,
  }),
  requirePermission(Permissions.TaskSubmit),
  async (req, res) => {
    // Task submission logic
  }
);
```

## Database Schema Extensions

### 1. Enhanced User Management

```sql
-- Extensions to existing schema
ALTER TABLE "User" ADD COLUMN "userGroup" TEXT NOT NULL DEFAULT 'data-annotator';
ALTER TABLE "User" ADD COLUMN "subscriptionTier" TEXT;
ALTER TABLE "User" ADD COLUMN "rateLimit" INTEGER DEFAULT 100;
ALTER TABLE "User" ADD COLUMN "apiRateLimit" INTEGER DEFAULT 10;
ALTER TABLE "User" ADD COLUMN "features" JSONB DEFAULT '[]';

-- User groups table
CREATE TABLE "UserGroup" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "defaultRateLimit" INTEGER NOT NULL DEFAULT 100,
  "defaultApiRateLimit" INTEGER NOT NULL DEFAULT 10,
  "features" JSONB DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserGroup_pkey" PRIMARY KEY ("id")
);

-- Rate limiting logs
CREATE TABLE "RateLimitLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "endpoint" TEXT NOT NULL,
  "ipAddress" TEXT,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "exceeded" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "RateLimitLog_pkey" PRIMARY KEY ("id")
);
```

## Frontend Integration

### 1. Enhanced Auth Provider

```typescript
// apps/web/src/providers/AuthProvider.tsx - Enhanced
interface AuthContextType {
  user: any;
  roles: Role[];
  permissions: Permission[];
  userGroup: string;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  can: (permission: Permission) => boolean;
  hasRole: (role: Role) => boolean;
  isInGroup: (group: string) => boolean;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userGroup, setUserGroup] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const can = useCallback((permission: Permission) => {
    return permissions.includes(permission);
  }, [permissions]);

  const hasRole = useCallback((role: Role) => {
    return roles.includes(role);
  }, [roles]);

  const isInGroup = useCallback((group: string) => {
    return userGroup === group;
  }, [userGroup]);

  // ... rest of implementation
};
```

### 2. Route Protection Components

```typescript
// apps/web/src/components/ProtectedRoute.tsx
interface ProtectedRouteProps {
  permission?: Permission;
  role?: Role;
  userGroup?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  permission,
  role,
  userGroup,
  children,
  fallback = <Navigate to="/unauthorized" replace />
}) => {
  const { can, hasRole, isInGroup, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (permission && !can(permission)) return fallback;
  if (role && !hasRole(role)) return fallback;
  if (userGroup && !isInGroup(userGroup)) return fallback;

  return <>{children}</>;
};
```

## Implementation Checklist

### Phase 1: Core RBAC Setup
- [ ] Update `@tetrix/rbac` package with extended roles and permissions
- [ ] Implement enhanced authentication middleware
- [ ] Create role-permission mapping system
- [ ] Set up database schema extensions
- [ ] Implement frontend auth provider enhancements

### Phase 2: Rate Limiting
- [ ] Install and configure Redis for rate limiting
- [ ] Implement rate limiting middleware
- [ ] Add route-specific rate limits
- [ ] Create rate limit monitoring and logging

### Phase 3: User Group Implementation
- [ ] Data Annotators: Complete implementation
- [ ] Code Academy: Implement academy-specific features
- [ ] Enterprise Clients: Design and implement enterprise features

### Phase 4: Monitoring & Analytics
- [ ] Implement RBAC audit logging
- [ ] Create rate limiting analytics
- [ ] Set up user activity monitoring
- [ ] Implement security alerts

## Security Considerations

1. **Token Management**: Implement proper JWT token refresh and rotation
2. **Rate Limiting**: Use Redis for distributed rate limiting
3. **Audit Logging**: Log all permission checks and access attempts
4. **Input Validation**: Validate all user inputs and API parameters
5. **CORS Configuration**: Properly configure CORS for different user groups
6. **API Versioning**: Implement API versioning for enterprise clients

## Monitoring & Maintenance

1. **Performance Monitoring**: Monitor API response times and rate limit effectiveness
2. **Security Monitoring**: Track failed authentication attempts and permission violations
3. **Usage Analytics**: Monitor feature usage across different user groups
4. **Regular Audits**: Conduct regular security audits of RBAC implementation

This comprehensive RBAC implementation provides a solid foundation for managing access control across your three user groups while maintaining security, performance, and scalability. 