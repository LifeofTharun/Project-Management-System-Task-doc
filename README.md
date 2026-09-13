# ProPulse - Project & Task Management System 🚀

A modern, secure, full-stack **Project Management System** designed to help teams and individuals plan projects, organize tasks, monitor development velocity, and analyze project health via real-time interactive dashboards.

Built to strictly fulfill all requirements specified in the project assessment document.

---

## 🌟 Key Features

### 1. 🔐 User Authentication & Authorization
- **Registration, Login, and Session Persistence** with JWT (JSON Web Tokens).
- **Password Security**: Passwords hashed using `bcrypt` (12 salt rounds). Plain-text passwords are never stored.
- **Data Isolation & Ownership**: Users can only access, modify, or delete their own projects and tasks. Unauthorized cross-user requests receive `403 Forbidden`.
- **Brute-Force Protection**: IP-based rate limiting on `/api/auth/*` endpoints using `express-rate-limit`.

### 2. 📁 Project Management
- Full CRUD capabilities: Create, View, Edit, and Delete projects.
- Lifecycle tracking: `Not Started`, `In Progress`, and `Completed`.
- Start Dates, End Dates, Creation timestamps, and dynamic task completion progress percentages.
- **Search & Filter**: Real-time project search by name and filtering by status.

### 3. ✅ Task Management
- Nested and Global Task Management: Create, Edit, Delete, and toggle task completion.
- Priority assignment: `Low`, `Medium`, `High`.
- Status workflow: `Pending`, `In Progress`, `Completed`.
- **Kanban Board & List Views**: Drag-style status shifts and table views.
- **Multi-Filter**: Filter tasks by project, status, priority, and search by task name.

### 4. 📊 Dynamic Metrics Dashboard
- Live dashboard recalculating statistics based on the authenticated user's data:
  - Total Projects
  - Total Tasks
  - Completed Tasks & Completion Rate (%)
  - Pending Tasks
  - Projects In Progress
- Visual **Recharts** charts: Task status breakdown donut chart and Tasks by Priority bar chart.
- Quick navigation to active projects and recently created tasks.

### 5. 🎁 Bonus Features Included
- **Docker & Docker Compose**: Multi-container setup for PostgreSQL, Express Backend, and React Frontend.
- **Automated Tests**: Jest & Supertest integration test suite with 100% passing tests covering Auth, CRUD, Rate Limiting, and User Isolation.
- **Audit Logging**: Immutable tracking of user sessions and entity mutations (`/api/audit-logs`).
- **CI/CD Pipeline**: GitHub Actions workflow (`.github/workflows/ci.yml`).

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM, JWT, Bcrypt, Express-Validator |
| **Database** | Relational DB (PostgreSQL / SQLite for local zero-config execution) |
| **DevOps** | Docker, Docker Compose, GitHub Actions |
| **Testing** | Jest, Supertest, ts-jest |

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Clone & Setup Backend
```bash
cd backend
npm install
npx prisma db push
npx ts-node prisma/seed.ts   # Populates demo account and sample projects
npm run dev                  # Starts server on http://localhost:5000
```

### 2. Setup Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev                  # Starts Vite dev server on http://localhost:5173
```

Open your browser at **`http://localhost:5173`**.

---

## 🔑 Demo Account Credentials

A pre-populated demo account is available with sample projects and tasks:
- **Email**: `demo@example.com`
- **Password**: `Password123!`

*(You can also register a new account or click the "Fill Pre-configured Demo Account" button on the login screen.)*

---

## 🧪 Running Automated Tests

Run the complete backend integration and unit test suite:
```bash
cd backend
npm test
```

Test coverage includes:
- Registration, duplicate email rejection, input format validation
- Login authentication, password verification, `/me` profile retrieval
- Project CRUD, ownership guard & unauthorized access rejection (403)
- Task CRUD, status updates, search and filter queries
- Dynamic dashboard statistics calculations

---

## 🐳 Docker Deployment

To launch the full stack with PostgreSQL, Backend, and Frontend containers:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- PostgreSQL: `localhost:5432`

---

## 📚 Documentation Links
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Database Schema & ER Diagram](docs/DATABASE_SCHEMA.md)

---

## 📁 Project Structure

```
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Relational models and foreign key constraints
│   │   └── seed.ts            # Demo seed data script
│   ├── src/
│   │   ├── __tests__/         # Automated test suites
│   │   ├── config/            # Prisma client instance
│   │   ├── controllers/       # Auth, Project, Task, Dashboard, Audit controllers
│   │   ├── middleware/        # JWT auth, Rate limiters, Error handling, Validation
│   │   ├── routes/            # REST API route definitions
│   │   ├── utils/             # Audit logger helper
│   │   ├── app.ts             # Express app configuration
│   │   └── server.ts          # Server entry point
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Modals, Badges, Layout, Navbar, Sidebar, ProgressBars
│   │   ├── context/           # AuthContext & ThemeContext
│   │   ├── pages/             # Auth, Dashboard, Projects, ProjectDetail, Tasks, AuditLog
│   │   ├── services/          # Axios API client with JWT interceptors
│   │   ├── types/             # TypeScript interfaces
│   │   ├── App.tsx            # Routes and route protection
│   │   └── main.tsx
│   ├── Dockerfile
│   └── package.json
│
├── docs/
│   ├── API_DOCUMENTATION.md   # Endpoint documentation & payloads
│   └── DATABASE_SCHEMA.md     # Mermaid ER diagram & table specifications
│
├── docker-compose.yml
├── README.md
└── .github/workflows/ci.yml
```
