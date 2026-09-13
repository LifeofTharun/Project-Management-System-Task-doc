# REST API Documentation: Project Management System

**Base URL**: `http://localhost:5000/api`  
**Authentication**: Bearer JWT token in the `Authorization` header (`Authorization: Bearer <token>`).

---

## 1. Authentication Endpoints

### 1.1 Register User
- **Method**: `POST`
- **Route**: `/auth/register`
- **Rate Limit**: 20 requests / 15 mins
- **Request Body**:
```json
{
  "fullName": "Alice Johnson",
  "email": "alice@example.com",
  "password": "SecurePassword123!"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "Account registered successfully.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "cm3j9...",
      "fullName": "Alice Johnson",
      "email": "alice@example.com",
      "role": "USER",
      "createdAt": "2026-09-13T12:00:00.000Z"
    }
  }
}
```

---

### 1.2 User Login
- **Method**: `POST`
- **Route**: `/auth/login`
- **Rate Limit**: 20 requests / 15 mins
- **Request Body**:
```json
{
  "email": "alice@example.com",
  "password": "SecurePassword123!"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "cm3j9...",
      "fullName": "Alice Johnson",
      "email": "alice@example.com",
      "role": "USER",
      "createdAt": "2026-09-13T12:00:00.000Z"
    }
  }
}
```

---

### 1.3 User Logout
- **Method**: `POST`
- **Route**: `/auth/logout`
- **Header**: `Authorization: Bearer <token>`
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

---

### 1.4 Get Current User Profile
- **Method**: `GET`
- **Route**: `/auth/me`
- **Header**: `Authorization: Bearer <token>`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "id": "cm3j9...",
    "fullName": "Alice Johnson",
    "email": "alice@example.com",
    "role": "USER",
    "createdAt": "2026-09-13T12:00:00.000Z",
    "_count": {
      "projects": 3,
      "tasks": 8
    }
  }
}
```

---

## 2. Project Endpoints

### 2.1 Get All Projects
- **Method**: `GET`
- **Route**: `/projects`
- **Query Parameters**:
  - `search` (optional): Project name search term.
  - `status` (optional): `Not Started` | `In Progress` | `Completed`
  - `sortBy` (optional): `name` | `status` | `startDate` | `endDate` | `createdAt` (default: `createdAt`)
  - `sortOrder` (optional): `asc` | `desc` (default: `desc`)
  - `page` (optional): Integer (e.g., `1`)
  - `limit` (optional): Integer (e.g., `10`)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "proj_123",
      "name": "E-Commerce Platform Redesign",
      "description": "Revamping the storefront with Next.js",
      "status": "In Progress",
      "startDate": "2026-09-01T00:00:00.000Z",
      "endDate": "2026-10-30T00:00:00.000Z",
      "userId": "user_456",
      "createdAt": "2026-09-13T12:00:00.000Z",
      "updatedAt": "2026-09-13T12:00:00.000Z",
      "stats": {
        "totalTasks": 4,
        "completedTasks": 2,
        "inProgressTasks": 1,
        "pendingTasks": 1,
        "progressPercentage": 50
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### 2.2 Get Project by ID
- **Method**: `GET`
- **Route**: `/projects/:id`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "id": "proj_123",
    "name": "E-Commerce Platform Redesign",
    "description": "Revamping the storefront with Next.js",
    "status": "In Progress",
    "tasks": [
      {
        "id": "task_1",
        "name": "Implement UI mockups",
        "priority": "High",
        "status": "Completed"
      }
    ],
    "stats": {
      "totalTasks": 1,
      "completedTasks": 1,
      "progressPercentage": 100
    }
  }
}
```

---

### 2.3 Create Project
- **Method**: `POST`
- **Route**: `/projects`
- **Request Body**:
```json
{
  "name": "AI Search Integration",
  "description": "Integrate vector search into backend.",
  "status": "Not Started",
  "startDate": "2026-10-01",
  "endDate": "2026-11-15"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "Project created successfully.",
  "data": {
    "id": "proj_789",
    "name": "AI Search Integration",
    "status": "Not Started"
  }
}
```

---

### 2.4 Update Project
- **Method**: `PUT`
- **Route**: `/projects/:id`
- **Request Body**:
```json
{
  "status": "In Progress"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Project updated successfully.",
  "data": { ... }
}
```

---

### 2.5 Delete Project
- **Method**: `DELETE`
- **Route**: `/projects/:id`
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Project and all its associated tasks deleted successfully."
}
```

---

## 3. Task Endpoints

### 3.1 Get All Tasks
- **Method**: `GET`
- **Route**: `/tasks`
- **Query Parameters**:
  - `projectId` (optional): Filter tasks by project ID.
  - `status` (optional): `Pending` | `In Progress` | `Completed`
  - `priority` (optional): `Low` | `Medium` | `High`
  - `search` (optional): Search by task name.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "task_99",
      "name": "Write automated Jest tests",
      "priority": "High",
      "status": "In Progress",
      "dueDate": "2026-09-25T00:00:00.000Z",
      "project": {
        "id": "proj_123",
        "name": "E-Commerce Platform Redesign"
      }
    }
  ]
}
```

---

### 3.2 Create Task
- **Method**: `POST`
- **Route**: `/tasks`
- **Request Body**:
```json
{
  "name": "Setup Docker Compose",
  "description": "Containerize API and Database",
  "priority": "Medium",
  "status": "Pending",
  "dueDate": "2026-10-01",
  "projectId": "proj_123"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "Task created successfully.",
  "data": { ... }
}
```

---

### 3.3 Update Task
- **Method**: `PUT`
- **Route**: `/tasks/:id`
- **Request Body**:
```json
{
  "status": "Completed"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Task updated successfully.",
  "data": { ... }
}
```

---

### 3.4 Delete Task
- **Method**: `DELETE`
- **Route**: `/tasks/:id`
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Task deleted successfully."
}
```

---

## 4. Dashboard Endpoints

### 4.1 Get Dashboard Statistics
- **Method**: `GET`
- **Route**: `/dashboard/stats`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "totalProjects": 4,
    "totalTasks": 12,
    "completedTasks": 7,
    "pendingTasks": 3,
    "projectsInProgress": 2,
    "projectsCompleted": 1,
    "projectsNotStarted": 1,
    "inProgressTasks": 2,
    "taskCompletionRate": 58,
    "projectCompletionRate": 25,
    "taskPriorityBreakdown": {
      "high": 4,
      "medium": 6,
      "low": 2
    },
    "recentProjects": [ ... ],
    "recentTasks": [ ... ]
  }
}
```
