export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
  _count?: {
    projects: number;
    tasks: number;
  };
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: 'Not Started' | 'In Progress' | 'Completed';
  startDate: string | null;
  endDate: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
  _count?: {
    tasks: number;
  };
  stats?: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
    progressPercentage: number;
  };
}

export interface Task {
  id: string;
  name: string;
  description: string | null;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Completed';
  dueDate: string | null;
  projectId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
    status: string;
  };
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  projectsInProgress: number;
  projectsCompleted: number;
  projectsNotStarted: number;
  inProgressTasks: number;
  taskCompletionRate: number;
  projectCompletionRate: number;
  taskPriorityBreakdown: {
    high: number;
    medium: number;
    low: number;
  };
  projectStatusBreakdown: {
    notStarted: number;
    inProgress: number;
    completed: number;
  };
  taskStatusBreakdown: {
    pending: number;
    inProgress: number;
    completed: number;
  };
  recentProjects: Project[];
  recentTasks: Task[];
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: string | null;
  createdAt: string;
}
