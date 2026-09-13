import axios from 'axios';
import {
  getStoredUsers,
  getStoredProjects,
  getStoredTasks,
  getStoredAuditLogs,
  saveAuditLog,
  calculateDashboardStats
} from './mockStorage';
import { Project, Task, User } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pro_pulse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Fallback Adapter for Vercel Static Deployments
// Ensures that Login, Registration, Project CRUD, Task CRUD, and Dashboard always work 100% seamlessly online
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest.url || '';
    const method = (originalRequest.method || 'get').toLowerCase();

    // If server is unreachable (404/500/Network Error on static deployment)
    if (!error.response || error.response.status === 404 || error.response.status === 502 || error.response.status === 500) {
      const currentUserData = localStorage.getItem('pro_pulse_user');
      const currentUser: User | null = currentUserData ? JSON.parse(currentUserData) : null;
      const currentUserId = currentUser?.id || 'usr_demo_123';

      // 1. Auth Login
      if (url.includes('/auth/login') && method === 'post') {
        const body = JSON.parse(originalRequest.data || '{}');
        const users = getStoredUsers();
        const user = users.find((u) => u.email.toLowerCase() === body.email?.toLowerCase());

        if (user && user.password === body.password) {
          const { password, ...userWithoutPass } = user;
          saveAuditLog(user.id, 'USER_LOGGED_IN', 'AUTH', user.id, { email: user.email });
          return {
            status: 200,
            data: {
              success: true,
              message: 'Login successful.',
              data: {
                token: `jwt_token_${user.id}_${Date.now()}`,
                user: userWithoutPass
              }
            }
          };
        } else {
          return Promise.reject({
            response: {
              status: 401,
              data: { success: false, message: 'Invalid email address or password.' }
            }
          });
        }
      }

      // 2. Auth Register
      if (url.includes('/auth/register') && method === 'post') {
        const body = JSON.parse(originalRequest.data || '{}');
        const users = getStoredUsers();
        const existing = users.find((u) => u.email.toLowerCase() === body.email?.toLowerCase());

        if (existing) {
          return Promise.reject({
            response: {
              status: 409,
              data: { success: false, message: 'A user with this email address already exists.' }
            }
          });
        }

        const newUser: User & { password?: string } = {
          id: `usr_${Date.now()}`,
          fullName: body.fullName,
          email: body.email,
          role: 'USER',
          createdAt: new Date().toISOString(),
          password: body.password
        };
        users.push(newUser);
        localStorage.setItem('propulse_users_db', JSON.stringify(users));
        saveAuditLog(newUser.id, 'USER_REGISTERED', 'AUTH', newUser.id, { email: newUser.email });

        const { password, ...userWithoutPass } = newUser;
        return {
          status: 201,
          data: {
            success: true,
            message: 'Account registered successfully.',
            data: {
              token: `jwt_token_${newUser.id}_${Date.now()}`,
              user: userWithoutPass
            }
          }
        };
      }

      // 3. Auth Me
      if (url.includes('/auth/me')) {
        if (currentUser) {
          return {
            status: 200,
            data: { success: true, data: currentUser }
          };
        }
      }

      // 4. Dashboard Stats
      if (url.includes('/dashboard/stats')) {
        const stats = calculateDashboardStats(currentUserId);
        return {
          status: 200,
          data: { success: true, data: stats }
        };
      }

      // 5. Projects
      if (url.startsWith('/projects') || url.includes('/projects')) {
        const storedProjects = getStoredProjects(currentUserId);

        // GET /projects/:id
        const matchSingle = url.match(/\/projects\/([a-zA-Z0-9_-]+)$/);
        if (matchSingle && method === 'get') {
          const projId = matchSingle[1];
          const found = storedProjects.find((p) => p.id === projId);
          if (found) {
            return { status: 200, data: { success: true, data: found } };
          }
          return Promise.reject({ response: { status: 404, data: { success: false, message: 'Project not found.' } } });
        }

        // POST /projects
        if (method === 'post') {
          const body = JSON.parse(originalRequest.data || '{}');
          const allProjectsData = localStorage.getItem('propulse_projects_db');
          const allProjects: Project[] = allProjectsData ? JSON.parse(allProjectsData) : storedProjects;

          const newProj: Project = {
            id: `proj_${Date.now()}`,
            name: body.name,
            description: body.description || null,
            status: body.status || 'Not Started',
            startDate: body.startDate || null,
            endDate: body.endDate || null,
            userId: currentUserId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          allProjects.unshift(newProj);
          localStorage.setItem('propulse_projects_db', JSON.stringify(allProjects));
          saveAuditLog(currentUserId, 'CREATE_PROJECT', 'PROJECT', newProj.id, { name: newProj.name });

          return {
            status: 201,
            data: { success: true, message: 'Project created successfully.', data: newProj }
          };
        }

        // PUT /projects/:id
        if (method === 'put') {
          const projId = url.split('/').pop();
          const body = JSON.parse(originalRequest.data || '{}');
          const allProjectsData = localStorage.getItem('propulse_projects_db');
          let allProjects: Project[] = allProjectsData ? JSON.parse(allProjectsData) : storedProjects;

          allProjects = allProjects.map((p) => (p.id === projId ? { ...p, ...body, updatedAt: new Date().toISOString() } : p));
          localStorage.setItem('propulse_projects_db', JSON.stringify(allProjects));
          saveAuditLog(currentUserId, 'UPDATE_PROJECT', 'PROJECT', projId, body);

          return {
            status: 200,
            data: { success: true, message: 'Project updated successfully.', data: { id: projId, ...body } }
          };
        }

        // DELETE /projects/:id
        if (method === 'delete') {
          const projId = url.split('/').pop();
          const allProjectsData = localStorage.getItem('propulse_projects_db');
          let allProjects: Project[] = allProjectsData ? JSON.parse(allProjectsData) : storedProjects;

          allProjects = allProjects.filter((p) => p.id !== projId);
          localStorage.setItem('propulse_projects_db', JSON.stringify(allProjects));
          saveAuditLog(currentUserId, 'DELETE_PROJECT', 'PROJECT', projId);

          return {
            status: 200,
            data: { success: true, message: 'Project deleted successfully.' }
          };
        }

        // GET /projects (List)
        return {
          status: 200,
          data: { success: true, data: storedProjects }
        };
      }

      // 6. Tasks
      if (url.startsWith('/tasks') || url.includes('/tasks')) {
        const storedTasks = getStoredTasks(currentUserId);

        // POST /tasks
        if (method === 'post') {
          const body = JSON.parse(originalRequest.data || '{}');
          const allTasksData = localStorage.getItem('propulse_tasks_db');
          const allTasks: Task[] = allTasksData ? JSON.parse(allTasksData) : storedTasks;

          const newTask: Task = {
            id: `task_${Date.now()}`,
            name: body.name,
            description: body.description || null,
            priority: body.priority || 'Medium',
            status: body.status || 'Pending',
            dueDate: body.dueDate || null,
            projectId: body.projectId,
            userId: currentUserId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          allTasks.unshift(newTask);
          localStorage.setItem('propulse_tasks_db', JSON.stringify(allTasks));
          saveAuditLog(currentUserId, 'CREATE_TASK', 'TASK', newTask.id, { name: newTask.name });

          return {
            status: 201,
            data: { success: true, message: 'Task created successfully.', data: newTask }
          };
        }

        // PUT /tasks/:id
        if (method === 'put') {
          const taskId = url.split('/').pop();
          const body = JSON.parse(originalRequest.data || '{}');
          const allTasksData = localStorage.getItem('propulse_tasks_db');
          let allTasks: Task[] = allTasksData ? JSON.parse(allTasksData) : storedTasks;

          allTasks = allTasks.map((t) => (t.id === taskId ? { ...t, ...body, updatedAt: new Date().toISOString() } : t));
          localStorage.setItem('propulse_tasks_db', JSON.stringify(allTasks));
          saveAuditLog(currentUserId, 'UPDATE_TASK', 'TASK', taskId, body);

          return {
            status: 200,
            data: { success: true, message: 'Task updated successfully.', data: { id: taskId, ...body } }
          };
        }

        // DELETE /tasks/:id
        if (method === 'delete') {
          const taskId = url.split('/').pop();
          const allTasksData = localStorage.getItem('propulse_tasks_db');
          let allTasks: Task[] = allTasksData ? JSON.parse(allTasksData) : storedTasks;

          allTasks = allTasks.filter((t) => t.id !== taskId);
          localStorage.setItem('propulse_tasks_db', JSON.stringify(allTasks));
          saveAuditLog(currentUserId, 'DELETE_TASK', 'TASK', taskId);

          return {
            status: 200,
            data: { success: true, message: 'Task deleted successfully.' }
          };
        }

        // GET /tasks (List)
        return {
          status: 200,
          data: { success: true, data: storedTasks }
        };
      }

      // 7. Audit Logs
      if (url.includes('/audit-logs')) {
        const logs = getStoredAuditLogs(currentUserId);
        return {
          status: 200,
          data: { success: true, data: logs }
        };
      }
    }

    return Promise.reject(error);
  }
);

export default api;
