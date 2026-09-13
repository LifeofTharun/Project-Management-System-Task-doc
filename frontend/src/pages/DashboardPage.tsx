import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { DashboardStats } from '../types';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  PlayCircle,
  ListTodo,
  TrendingUp,
  Plus,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard statistics:', err);
      setError('Unable to load dashboard data. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner fullHeight message="Loading your workspace analytics..." />;
  }

  if (error || !stats) {
    return (
      <div className="p-8 text-center glass-panel rounded-2xl">
        <AlertCircle className="mx-auto text-rose-500 mb-3" size={32} />
        <p className="text-slate-600 dark:text-slate-300 font-medium">{error || 'Failed to fetch data'}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Chart datasets
  const taskStatusData = [
    { name: 'Completed', value: stats.taskStatusBreakdown.completed, color: '#10b981' },
    { name: 'In Progress', value: stats.taskStatusBreakdown.inProgress, color: '#f59e0b' },
    { name: 'Pending', value: stats.taskStatusBreakdown.pending, color: '#38bdf8' }
  ].filter(d => d.value > 0);

  const priorityData = [
    { name: 'High', count: stats.taskPriorityBreakdown.high, fill: '#f43f5e' },
    { name: 'Medium', count: stats.taskPriorityBreakdown.medium, fill: '#6366f1' },
    { name: 'Low', count: stats.taskPriorityBreakdown.low, fill: '#14b8a6' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-indigo-950/20 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Workspace Online</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.fullName || 'Manager'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-xl">
            Here is what’s happening with your projects and tasks today. You have completed {stats.taskCompletionRate}% of your total workload.
          </p>
        </div>

        <div className="relative z-10 flex gap-3">
          <Link
            to="/projects"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-900 text-xs font-bold hover:bg-indigo-50 shadow-lg transition-all"
          >
            <Plus size={16} />
            <span>New Project</span>
          </Link>
          <Link
            to="/tasks"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold border border-white/20 shadow-lg transition-all"
          >
            <ListTodo size={16} />
            <span>Manage Tasks</span>
          </Link>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Top 5 Key Metric Cards (Required by Assessment Specification) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Projects */}
        <div className="glass-panel p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Projects</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <FolderKanban size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalProjects}</span>
            <span className="text-[11px] text-slate-400">projects owned</span>
          </div>
        </div>

        {/* Card 2: Total Tasks */}
        <div className="glass-panel p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Tasks</span>
            <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
              <ListTodo size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalTasks}</span>
            <span className="text-[11px] text-slate-400">action items</span>
          </div>
        </div>

        {/* Card 3: Completed Tasks */}
        <div className="glass-panel p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Completed Tasks</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.completedTasks}</span>
            <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">
              {stats.taskCompletionRate}% done
            </span>
          </div>
        </div>

        {/* Card 4: Pending Tasks */}
        <div className="glass-panel p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Tasks</span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <Clock size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-sky-600 dark:text-sky-400">{stats.pendingTasks}</span>
            <span className="text-[11px] text-slate-400">to start</span>
          </div>
        </div>

        {/* Card 5: Projects In Progress */}
        <div className="glass-panel p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Projects In Progress</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <PlayCircle size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.projectsInProgress}</span>
            <span className="text-[11px] text-slate-400">active now</span>
          </div>
        </div>
      </div>

      {/* Analytics Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Status Distribution Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Task Status Breakdown</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Distribution across stages</p>
            </div>
            <TrendingUp size={18} className="text-slate-400" />
          </div>

          {taskStatusData.length > 0 ? (
            <div className="h-56 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-xs text-slate-400">
              No tasks created yet
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 mt-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <div>
              <span className="text-[11px] text-slate-400 block">Completed</span>
              <span className="text-sm font-bold text-emerald-600">{stats.completedTasks}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">In Progress</span>
              <span className="text-sm font-bold text-amber-500">{stats.inProgressTasks}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Pending</span>
              <span className="text-sm font-bold text-sky-500">{stats.pendingTasks}</span>
            </div>
          </div>
        </div>

        {/* Priority Breakdown Bar Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Tasks by Priority</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Workload urgency overview</p>
            </div>
          </div>

          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <div>
              <span className="text-[11px] text-rose-500 font-medium block">High Priority</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{stats.taskPriorityBreakdown.high}</span>
            </div>
            <div>
              <span className="text-[11px] text-indigo-500 font-medium block">Medium</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{stats.taskPriorityBreakdown.medium}</span>
            </div>
            <div>
              <span className="text-[11px] text-teal-500 font-medium block">Low</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{stats.taskPriorityBreakdown.low}</span>
            </div>
          </div>
        </div>

        {/* Project Health Progress */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Project Pipeline</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Overall project status delivery</p>
              </div>
            </div>

            <div className="space-y-4 my-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Completed Projects</span>
                  <span className="text-emerald-600">{stats.projectsCompleted} / {stats.totalProjects}</span>
                </div>
                <ProgressBar progress={stats.projectCompletionRate} showLabel={false} size="sm" />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600 dark:text-slate-400">In Progress Projects</span>
                  <span className="text-amber-600">{stats.projectsInProgress} / {stats.totalProjects}</span>
                </div>
                <ProgressBar
                  progress={stats.totalProjects > 0 ? (stats.projectsInProgress / stats.totalProjects) * 100 : 0}
                  showLabel={false}
                  size="sm"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Not Started</span>
                  <span className="text-slate-500">{stats.projectsNotStarted} / {stats.totalProjects}</span>
                </div>
                <ProgressBar
                  progress={stats.totalProjects > 0 ? (stats.projectsNotStarted / stats.totalProjects) * 100 : 0}
                  showLabel={false}
                  size="sm"
                />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
            <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
              💡 Task Productivity Tip
            </p>
            <p className="text-[11px] text-indigo-700 dark:text-indigo-300/80 mt-0.5">
              Break larger projects into smaller manageable tasks with distinct due dates to maintain team velocity.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Projects & Recent Tasks split section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent Projects</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Latest active initiatives</p>
            </div>
            <Link
              to="/projects"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
            >
              <span>View All</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {stats.recentProjects.length > 0 ? (
              stats.recentProjects.map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className="block p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 border border-slate-200/60 dark:border-slate-700/60 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 pr-3">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {p.description || 'No description provided'}
                      </p>
                    </div>
                    <Badge type="status" value={p.status} size="sm" />
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No projects yet. Create your first project!</p>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent Tasks</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Recently created action items</p>
            </div>
            <Link
              to="/tasks"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
            >
              <span>View All</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {stats.recentTasks.length > 0 ? (
              stats.recentTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
                >
                  <div className="min-w-0 pr-3">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {t.name}
                    </h4>
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium truncate mt-0.5">
                      {t.project?.name || 'Assigned Project'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge type="priority" value={t.priority} size="sm" />
                    <Badge type="status" value={t.status} size="sm" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No tasks yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
