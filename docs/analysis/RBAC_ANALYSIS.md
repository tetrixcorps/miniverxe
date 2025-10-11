# RBAC (Role-Based Access Control) Analysis

## Overview
This document provides a thorough analysis of the Role-Based Access Control (RBAC) implementation in the codebase, covering all user groups, roles, and permissions.

## System Architecture

### RBAC Components
1. **Roles Package** (`packages/rbac/`): Centralized role and permission definitions
2. **API Middleware** (`services/api/src/middleware/`): Server-side authentication and authorization
3. **Firestore Security Rules** (`firestore.rules`): Database-level access control
4. **Frontend Authentication** (`apps/web/src/providers/`): Client-side authentication context

## User Groups and Roles

### 1. Administrative Group
**Primary Role: ADMIN**
- **Description**: System administrators with full access
- **Permissions**:
  - User management (create, read, update, delete users)
  - Role assignment and modification
  - Contact submission management
  - Project deletion
  - Payment management
  - System analytics access
  - Audit log access
  - Wallet payout operations
  - Academy assignment management and grading

**Associated Roles from RBAC Package**:
- `SuperAdmin`: Highest level administrative access
- `BillingAdmin`: Specialized admin for billing operations
- `Owner`: Owner-level permissions

### 2. Project Management Group
**Primary Role: PROJECT_MANAGER**
- **Description**: Project coordinators and managers
- **Permissions**:
  - Project creation and management
  - Task creation and batch operations
  - User profile viewing (limited)
  - Analytics access
  - Project membership management
  - Task assignment and monitoring

**Associated Roles from RBAC Package**:
- `TaskAdmin`: Task-specific administrative functions

### 3. Review and Quality Control Group
**Primary Role: REVIEWER**
- **Description**: Quality assurance and review specialists
- **Permissions**:
  - Task review and approval/rejection
  - Review comment management
  - Task status updates (submitted → approved/rejected)
  - Access to assigned tasks for review
  - Rating and feedback provision

**Associated Roles from RBAC Package**:
- `Reviewer`: Standard review operations
- `AcademyReviewer`: Specialized for academy content review

### 4. Annotation and Labeling Group
**Primary Role: ANNOTATOR**
- **Description**: Data annotators and labelers
- **Permissions**:
  - Task claiming (pending → in_progress)
  - Annotation submission (in_progress → submitted)
  - Access to assigned tasks only
  - Profile management (own data)
  - Task history viewing

**Associated Roles from RBAC Package**:
- `Labeler`: Data labeling operations

### 5. Learning and Development Group
**Primary Role: ACADEMY_STUDENT**
- **Description**: Students in the academy learning system
- **Permissions**:
  - Academy assignment access
  - Learning content viewing
  - Progress tracking
  - Assignment submission
  - Limited task access for learning purposes

**Associated Roles from RBAC Package**:
- `CodingStudent`: Specialized for coding-related learning

## Permission System

### Core Permissions (from packages/rbac/permissions.ts)
```typescript
- AssignTask: 'task.assign'
- ReviewTask: 'task.review'
- AdminContactRead: 'admin:contact:read'
- AdminContactUpdate: 'admin:contact:update'
- AdminLogout: 'admin:logout'
- UserList: 'user:list'
- UserRead: 'user:read'
- UserUpdate: 'user:update'
- UserRoleUpdate: 'user:role:update'
- ProjectRead: 'project:read'
```

### Database-Level Permissions (Firestore Rules)

#### User Management
- **Read**: Own profile + admins/project managers can read all
- **Write**: Own profile + admins can write all
- **Role Changes**: Admins only

#### Task Management
- **Read**: Assigned users, reviewers, admins, project managers
- **Create**: Admins and project managers only
- **Update**: Role-based with status transitions
- **Delete**: Admins only

#### Project Management
- **Read**: All authenticated users
- **Create/Update**: Admins and project managers
- **Delete**: Admins only

#### Contact Submissions
- **Read/Write**: Admins only
- **Create**: Public (for contact forms)

#### Analytics
- **Read**: Admins and project managers only
- **Write**: System only

## API Route Protection

### Authentication Middleware
```typescript
// services/api/src/middleware/auth.ts
authGuard: Verifies Firebase JWT tokens
```

### Role-Based Middleware
```typescript
// services/api/src/middleware/roles.ts
requireRole(...roles): Enforces specific role requirements
```

### Route-Level Security Examples
- `/users/*`: Admin only (`requireRole('admin')`)
- `/projects/*`: Admin and project manager (`requireRole('admin', 'project_manager')`)
- `/contact/*`: Admin only (`requireRole('admin')`)
- `/tickets/:id/review`: Admin and reviewer (`requireRole('admin', 'reviewer')`)

## Frontend RBAC Implementation

### Authentication Context
```typescript
// apps/web/src/providers/AuthProvider.tsx
- Manages user authentication state
- Handles role and permission extraction from JWT claims
- Provides authentication methods (signIn, signOut)
```

### Permission Checking
```typescript
// apps/web/src/hooks/useCan.ts
- Provides permission-based UI rendering
- Checks user permissions against required actions
```

## Database Schema Integration

### User Model
```prisma
model User {
  role: Role @default(ANNOTATOR)
  status: UserStatus @default(ACTIVE)
  organization: Organization?
  // Relations to tasks, reviews, analytics, etc.
}
```

### Role Enumeration
```prisma
enum Role {
  ADMIN
  PROJECT_MANAGER
  REVIEWER
  ANNOTATOR
  ACADEMY_STUDENT
}
```

### Status Management
```prisma
enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}
```

## Security Features

### Multi-Layer Security
1. **API Level**: JWT token verification + role middleware
2. **Database Level**: Firestore security rules
3. **Frontend Level**: Context-based authentication and permission checks

### Default Security Posture
- Default deny for unspecified collections
- Principle of least privilege
- Role-based access with ownership rules
- Status-based access control (ACTIVE users only)

## Three Primary User Groups Summary

### 1. **Administrative Group** (ADMIN, SuperAdmin, BillingAdmin, Owner)
- **Access Level**: Full system access
- **Key Responsibilities**: System management, user administration, billing
- **Unique Permissions**: User role modification, system configuration, audit access

### 2. **Project Operations Group** (PROJECT_MANAGER, TaskAdmin, REVIEWER, AcademyReviewer)
- **Access Level**: Project and task management
- **Key Responsibilities**: Project coordination, quality assurance, task review
- **Unique Permissions**: Project creation, task assignment, review operations

### 3. **Content Production Group** (ANNOTATOR, Labeler, ACADEMY_STUDENT, CodingStudent)
- **Access Level**: Task execution and learning
- **Key Responsibilities**: Data annotation, content creation, skill development
- **Unique Permissions**: Task claiming, annotation submission, learning progress

## Implementation Strengths
- Clear separation of concerns
- Multi-layer security implementation
- Comprehensive permission system
- Scalable role hierarchy
- Organization-based access control

## Areas for Enhancement
- Role-permission mapping could be more explicit
- Permission inheritance could be better documented
- Cross-organizational access rules could be clarified
- More granular permission definitions for complex workflows

## Conclusion
The RBAC system demonstrates a well-structured approach to access control with clear role definitions, comprehensive permission management, and multi-layer security implementation. The system effectively supports the three primary user groups while maintaining security and scalability.