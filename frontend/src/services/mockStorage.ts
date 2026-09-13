import { User, Project, Task, DashboardStats, AuditLog } from '../types';

const USERS_KEY = 'propulse_users_db';
const PROJECTS_KEY = 'propulse_projects_db';
const TASKS_KEY = 'propulse_tasks_db';
const AUDIT_KEY = 'propulse_audit_db';

// Initial Seed Data
const initialUser: User = {
  id: 'usr_demo_123',
  fullName: 'Tharun Kumar',
  email: 'demo@example.com',
  role: 'ADMIN',
  createdAt: new Date('2026-09-01').toISOString()
};

const initialProjects: Project[] = [
  {
    id: 'proj_1',
    name: 'E-Commerce Platform Redesign',
    description: 'Revamping the storefront with modern UI/UX, Next.js, and Stripe payment gateway.',
    status: 'In Progress',
    startDate: '2026-09-01',
    endDate: '2026-10-30',
    userId: 'usr_demo_123',
    createdAt: new Date('2026-09-01').toISOString(),
    updatedAt: new Date('2026-09-01').toISOString()
  },
  {
    id: 'proj_2',
    name: 'Mobile Banking App API',
    description: 'Building secure microservices for biometric authentication, transfers, and statements.',
    status: 'Not Started',
    startDate: '2026-10-01',
    endDate: '2026-12-15',
    userId: 'usr_demo_123',
    createdAt: new Date('2026-09-05').toISOString(),
    updatedAt: new Date('2026-09-05').toISOString()
  },
  {
    id: 'proj_3',
    name: 'AI Customer Support Bot',
    description: 'Deploying LLM-driven automated ticket resolution assistant for enterprise clients.',
    status: 'Completed',
    startDate: '2026-07-01',
    endDate: '2026-08-30',
    userId: 'usr_demo_123',
    createdAt: new Date('2026-08-01').toISOString(),
    updatedAt: new Date('2026-08-30').toISOString()
  }
];

const initialTasks: Task[] = [
  {
    id: 'task_1',
    name: 'Design high-fidelity Figma mockups',
    description: 'Complete UI mockups for product listing, cart, and checkout pages.',
    priority: 'High',
    status: 'Completed',
    dueDate: '2026-09-10',
    projectId: 'proj_1',
    userId: 'usr_demo_123',
    createdAt: new Date('2026-09-02').toISOString(),
    updatedAt: new Date('2026-09-10').toISOString()
  },
  {
    id: 'task_2',
    name: 'Implement JWT & OAuth Authentication',
    description: 'Set up access tokens, refresh tokens, and rate-limiting security middleware.',
    priority: 'High',
    status: 'In Progress',
    dueDate: '2026-09-20',
    projectId: 'proj_1',
    userId: 'usr_demo_123',
    createdAt: new Date('2026-09-05').toISOString(),
    updatedAt: new Date('2026-09-05').toISOString()
  },
  {
    id: 'task_3',
    name: 'Integrate Stripe Webhook Listeners',
    description: 'Handle payment succeed and subscription update webhook events securely.',
    priority: 'Medium',
    status: 'Pending',
    dueDate: '2026-09-28',
    projectId: 'proj_1',
    userId: 'usr_demo_123',
    createdAt: new Date('2026-09-08').toISOString(),
    updatedAt: new Date('2026-09-08').toISOString()
  },
  {
    id: 'task_4',
    name: 'Define PostgreSQL Schema & Prisma migrations',
    description: 'Design accounts, transactions, and audit tables with foreign keys.',
    priority: 'High',
    status: 'Pending',
    dueDate: '2026-10-10',
    projectId: 'proj_2',
    userId: 'usr_demo_123',
    createdAt: new Date('2026-09-10').toISOString(),
    updatedAt: new Date('2026-09-10').toISOString()
  },
  {
    id: 'task_5',
    name: 'Setup Docker Compose for Development',
    description: 'Containerize PostgreSQL, Redis, and Express API services.',
    priority: 'Low',
    status: 'Pending',
    dueDate: '2026-10-15',
    projectId: 'proj_2',
    userId: 'usr_demo_123',
    createdAt: new Date('2026-09-11').toISOString(),
    updatedAt: new Date('2026-09-11').toISOString()
  },
  {
    id: 'task_6',
    name: 'Prompt Engineering & Fine-tuning Dataset',
    description: 'Curate domain-specific customer inquiries for model alignment.',
    priority: 'Medium',
    status: 'Completed',
    dueDate: '2026-08-15',
    projectId: 'proj_3',
    userId: 'usr_demo_123',
    createdAt: new Date('2026-08-05').toISOString(),
    updatedAt: new Date('2026-08-15').toISOString()
  }
];

const initialAudit: AuditLog[] = [
  {
    id: 'audit_1',
    userId: 'usr_demo_123',
    action: 'USER_REGISTERED',
    entityType: 'AUTH',
    entityId: 'usr_demo_123',
    details: JSON.stringify({ email: 'demo@example.com' }),
    createdAt: new Date('2026-09-01T10:00:00Z').toISOString()
  },
  {
    id: 'audit_2',
    userId: 'usr_demo_123',
    action: 'CREATE_PROJECT',
    entityType: 'PROJECT',
    entityId: 'proj_1',
    details: JSON.stringify({ name: 'E-Commerce Platform Redesign', status: 'In Progress' }),
    createdAt: new Date('2026-09-01T10:30:00Z').toISOString()
  },
  {
    id: 'audit_3',
    userId: 'usr_demo_123',
    action: 'CREATE_PROJECT',
    entityType: 'PROJECT',
    entityId: 'proj_2',
    details: JSON.stringify({ name: 'Mobile Banking App API', status: 'Not Started' }),
    createdAt: new Date('2026-09-05T14:15:00Z').toISOString()
  }
];

export function getStoredUsers(): (User & { password?: string })[] {
  const data = localStorage.getItem(USERS_KEY);
  if (!data) {
    const list = [{ ...initialUser, password: 'Password123!' }];
    localStorage.setItem(USERS_KEY, JSON.stringify(list));
    return list;
  }
  return JSON.parse(data);
}

export function getStoredProjects(userId: string): Project[] {
  const data = localStorage.getItem(PROJECTS_KEY);
  let projects: Project[] = [];
  if (!data) {
    projects = initialProjects;
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } else {
    projects = JSON.parse(data);
  }

  const tasks = getStoredTasks(userId);

  return projects
    .filter((p) => p.userId === userId)
    .map((proj) => {
      const projTasks = tasks.filter((t) => t.projectId === proj.id);
      const totalTasks = projTasks.length;
      const completedTasks = projTasks.filter((t) => t.status === 'Completed').length;
      const inProgressTasks = projTasks.filter((t) => t.status === 'In Progress').length;
      const pendingTasks = projTasks.filter((t) => t.status === 'Pending').length;
      const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...proj,
        tasks: projTasks,
        stats: {
          totalTasks,
          completedTasks,
          inProgressTasks,
          pendingTasks,
          progressPercentage
        }
      };
    });
}

export function getStoredTasks(userId: string): Task[] {
  const data = localStorage.getItem(TASKS_KEY);
  let tasks: Task[] = [];
  if (!data) {
    tasks = initialTasks;
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } else {
    tasks = JSON.parse(data);
  }

  const projects = getStoredProjects(userId);

  return tasks
    .filter((t) => t.userId === userId)
    .map((task) => {
      const p = projects.find((proj) => proj.id === task.projectId);
      return {
        ...task,
        project: p ? { id: p.id, name: p.name, status: p.status } : undefined
      };
    });
}

export function getStoredAuditLogs(userId: string): AuditLog[] {
  const data = localStorage.getItem(AUDIT_KEY);
  if (!data) {
    localStorage.setItem(AUDIT_KEY, JSON.stringify(initialAudit));
    return initialAudit.filter((a) => a.userId === userId);
  }
  const logs: AuditLog[] = JSON.parse(data);
  return logs.filter((a) => a.userId === userId);
}

export function saveAuditLog(userId: string, action: string, entityType: string, entityId?: string, details?: any) {
  const logs = getStoredAuditLogs(userId);
  const newLog: AuditLog = {
    id: `audit_${Date.now()}`,
    userId,
    action,
    entityType,
    entityId: entityId || null,
    details: details ? JSON.stringify(details) : null,
    createdAt: new Date().toISOString()
  };
  const allLogsData = localStorage.getItem(AUDIT_KEY);
  const allLogs: AuditLog[] = allLogsData ? JSON.parse(allLogsData) : initialAudit;
  allLogs.unshift(newLog);
  localStorage.setItem(AUDIT_KEY, JSON.stringify(allLogs));
}

export function calculateDashboardStats(userId: string): DashboardStats {
  const projects = getStoredProjects(userId);
  const tasks = getStoredTasks(userId);

  const totalProjects = projects.length;
  const projectsInProgress = projects.filter((p) => p.status === 'In Progress').length;
  const projectsCompleted = projects.filter((p) => p.status === 'Completed').length;
  const projectsNotStarted = projects.filter((p) => p.status === 'Not Started').length;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
  const pendingTasks = tasks.filter((t) => t.status === 'Pending').length;

  const high = tasks.filter((t) => t.priority === 'High').length;
  const medium = tasks.filter((t) => t.priority === 'Medium').length;
  const low = tasks.filter((t) => t.priority === 'Low').length;

  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const projectCompletionRate = totalProjects > 0 ? Math.round((projectsCompleted / totalProjects) * 100) : 0;

  return {
    totalProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
    projectsInProgress,
    projectsCompleted,
    projectsNotStarted,
    inProgressTasks,
    taskCompletionRate,
    projectCompletionRate,
    taskPriorityBreakdown: { high, medium, low },
    projectStatusBreakdown: {
      notStarted: projectsNotStarted,
      inProgress: projectsInProgress,
      completed: projectsCompleted
    },
    taskStatusBreakdown: {
      pending: pendingTasks,
      inProgress: inProgressTasks,
      completed: completedTasks
    },
    recentProjects: projects.slice(0, 5),
    recentTasks: tasks.slice(0, 5)
  };
}
