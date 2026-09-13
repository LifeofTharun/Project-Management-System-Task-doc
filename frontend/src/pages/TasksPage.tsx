import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Task, Project } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  Edit2,
  Trash2,
  Check,
  LayoutGrid,
  List,
  AlertTriangle,
  Folder
} from 'lucide-react';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPriority, setFormPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [formStatus, setFormStatus] = useState<'Pending' | 'In Progress' | 'Completed'>('Pending');
  const [formDueDate, setFormDueDate] = useState('');
  const [formProjectId, setFormProjectId] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTasksAndProjects = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (statusFilter.trim()) params.status = statusFilter.trim();
      if (priorityFilter.trim()) params.priority = priorityFilter.trim();
      if (projectFilter.trim()) params.projectId = projectFilter.trim();

      const [tasksRes, projectsRes] = await Promise.all([
        api.get('/tasks', { params }),
        api.get('/projects')
      ]);

      if (tasksRes.data.success) {
        setTasks(tasksRes.data.data);
      }
      if (projectsRes.data.success) {
        setProjects(projectsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasksAndProjects();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, priorityFilter, projectFilter]);

  const handleOpenCreate = () => {
    setFormName('');
    setFormDescription('');
    setFormPriority('Medium');
    setFormStatus('Pending');
    setFormDueDate('');
    setFormProjectId(projects[0]?.id || '');
    setFormError('');
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setSelectedTask(task);
    setFormName(task.name);
    setFormDescription(task.description || '');
    setFormPriority(task.priority);
    setFormStatus(task.status);
    setFormDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    setFormProjectId(task.projectId);
    setFormError('');
    setIsEditOpen(true);
  };

  const handleOpenDelete = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Task Name is required.');
      return;
    }
    if (!formProjectId) {
      setFormError('Please select a project for this task.');
      return;
    }
    try {
      setSubmitting(true);
      setFormError('');
      const res = await api.post('/tasks', {
        name: formName.trim(),
        description: formDescription.trim() || undefined,
        priority: formPriority,
        status: formStatus,
        dueDate: formDueDate || undefined,
        projectId: formProjectId
      });
      if (res.data.success) {
        setIsCreateOpen(false);
        fetchTasksAndProjects();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    if (!formName.trim()) {
      setFormError('Task Name is required.');
      return;
    }
    try {
      setSubmitting(true);
      setFormError('');
      const res = await api.put(`/tasks/${selectedTask.id}`, {
        name: formName.trim(),
        description: formDescription.trim() || undefined,
        priority: formPriority,
        status: formStatus,
        dueDate: formDueDate || null,
        projectId: formProjectId
      });
      if (res.data.success) {
        setIsEditOpen(false);
        fetchTasksAndProjects();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to update task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (task: Task, newStatus: 'Pending' | 'In Progress' | 'Completed') => {
    try {
      await api.put(`/tasks/${task.id}`, { status: newStatus });
      fetchTasksAndProjects();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedTask) return;
    try {
      setSubmitting(true);
      const res = await api.delete(`/tasks/${selectedTask.id}`);
      if (res.data.success) {
        setIsDeleteOpen(false);
        fetchTasksAndProjects();
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Group tasks for Kanban
  const pendingTasks = tasks.filter(t => t.status === 'Pending');
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
  const completedTasks = tasks.filter(t => t.status === 'Completed');

  const kanbanColumns = [
    { title: 'Pending', status: 'Pending' as const, items: pendingTasks, color: 'text-sky-500', bg: 'bg-sky-500/10' },
    { title: 'In Progress', status: 'In Progress' as const, items: inProgressTasks, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { title: 'Completed', status: 'Completed' as const, items: completedTasks, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Task Management Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track daily work items, adjust priorities, and manage project workflows.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95"
        >
          <Plus size={16} />
          <span>Add New Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by name..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[150px] truncate"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Kanban View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner fullHeight message="Loading tasks..." />
      ) : tasks.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <CheckSquare className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={48} />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Tasks Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery || statusFilter || priorityFilter
              ? 'No tasks matched your current search filters.'
              : 'You do not have any tasks yet. Create one now to start tracking your work!'}
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition-all"
          >
            <Plus size={15} />
            <span>Create First Task</span>
          </button>
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kanbanColumns.map((col) => (
            <div
              key={col.status}
              className="glass-panel rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.bg} ring-2 ring-current ${col.color}`} />
                  <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    {col.title}
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {col.items.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {col.items.length === 0 ? (
                  <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-[11px] text-slate-400">
                    No tasks in {col.title}
                  </div>
                ) : (
                  col.items.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
                    >
                      {/* Project Tag */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md truncate max-w-[160px]">
                          <Folder size={10} />
                          <span className="truncate">{task.project?.name || 'Project'}</span>
                        </span>
                        <Badge type="priority" value={task.priority} size="sm" />
                      </div>

                      {/* Task Name */}
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                        {task.name}
                      </h4>
                      {task.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                          {task.description}
                        </p>
                      )}

                      {/* Footer Details & Actions */}
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar size={11} />
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                        </span>

                        <div className="flex items-center gap-1">
                          {/* Quick Status Shift buttons */}
                          {task.status !== 'Pending' && (
                            <button
                              onClick={() => handleStatusChange(task, 'Pending')}
                              className="px-1.5 py-0.5 rounded text-[9px] bg-slate-100 text-slate-600 hover:bg-slate-200"
                              title="Move to Pending"
                            >
                              Pending
                            </button>
                          )}
                          {task.status !== 'In Progress' && (
                            <button
                              onClick={() => handleStatusChange(task, 'In Progress')}
                              className="px-1.5 py-0.5 rounded text-[9px] bg-amber-100 text-amber-700 hover:bg-amber-200"
                              title="Move to In Progress"
                            >
                              In Prog
                            </button>
                          )}
                          {task.status !== 'Completed' && (
                            <button
                              onClick={() => handleStatusChange(task, 'Completed')}
                              className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              title="Mark Done"
                            >
                              Done
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(task)}
                            className="p-1 rounded text-slate-400 hover:text-indigo-600"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(task)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="glass-panel rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/60 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3.5 px-4">Task Name</th>
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tasks.map((task) => {
                  const isCompleted = task.status === 'Completed';
                  return (
                    <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStatusChange(task, isCompleted ? 'Pending' : 'Completed')}
                            className={`w-5 h-5 rounded flex items-center justify-center border ${
                              isCompleted ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {isCompleted && <Check size={12} className="stroke-[3]" />}
                          </button>
                          <span className={isCompleted ? 'line-through text-slate-400' : ''}>{task.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-indigo-600 dark:text-indigo-400 font-medium">
                        {task.project?.name || '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge type="priority" value={task.priority} size="sm" />
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge type="status" value={task.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(task)}
                            className="p-1 rounded-lg text-slate-400 hover:text-indigo-600"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(task)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Task"
        subtitle="Specify task scope, urgency priority, and target due date."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-medium border border-rose-200">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Parent Project *
            </label>
            <select
              required
              value={formProjectId}
              onChange={(e) => setFormProjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" disabled>Select target project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Task Name *
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Implement rate limiting on auth endpoints"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Detailed description or requirements..."
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={formDueDate}
              onChange={(e) => setFormDueDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Task"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-medium border border-rose-200">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Parent Project *
            </label>
            <select
              value={formProjectId}
              onChange={(e) => setFormProjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Task Name *
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={formDueDate}
              onChange={(e) => setFormDueDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Task Confirmation */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Task"
      >
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle size={24} />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Delete "{selectedTask?.name}"?
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            This task will be permanently removed.
          </p>

          <div className="flex justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleDeleteSubmit}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 disabled:opacity-50"
            >
              {submitting ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
