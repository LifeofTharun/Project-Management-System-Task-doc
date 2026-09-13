import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Project, Task } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ProgressBar } from '../components/common/ProgressBar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  ArrowLeft,
  Calendar,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  PlayCircle,
  Edit2,
  Trash2,
  Check,
  AlertTriangle
} from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTask, setSearchTask] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Task Modal states
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [isDeleteTaskOpen, setIsDeleteTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Task Form fields
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [taskStatus, setTaskStatus] = useState<'Pending' | 'In Progress' | 'Completed'>('Pending');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskError, setTaskError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${id}`);
      if (res.data.success) {
        setProject(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load project details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProjectDetails();
  }, [id]);

  const handleOpenCreateTask = () => {
    setTaskName('');
    setTaskDescription('');
    setTaskPriority('Medium');
    setTaskStatus('Pending');
    setTaskDueDate('');
    setTaskError('');
    setIsCreateTaskOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setSelectedTask(task);
    setTaskName(task.name);
    setTaskDescription(task.description || '');
    setTaskPriority(task.priority);
    setTaskStatus(task.status);
    setTaskDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    setTaskError('');
    setIsEditTaskOpen(true);
  };

  const handleOpenDeleteTask = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteTaskOpen(true);
  };

  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) {
      setTaskError('Task Name is required.');
      return;
    }
    try {
      setSubmitting(true);
      setTaskError('');
      const res = await api.post('/tasks', {
        name: taskName.trim(),
        description: taskDescription.trim() || undefined,
        priority: taskPriority,
        status: taskStatus,
        dueDate: taskDueDate || undefined,
        projectId: id
      });
      if (res.data.success) {
        setIsCreateTaskOpen(false);
        fetchProjectDetails();
      }
    } catch (err: any) {
      setTaskError(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    if (!taskName.trim()) {
      setTaskError('Task Name is required.');
      return;
    }
    try {
      setSubmitting(true);
      setTaskError('');
      const res = await api.put(`/tasks/${selectedTask.id}`, {
        name: taskName.trim(),
        description: taskDescription.trim() || undefined,
        priority: taskPriority,
        status: taskStatus,
        dueDate: taskDueDate || null
      });
      if (res.data.success) {
        setIsEditTaskOpen(false);
        fetchProjectDetails();
      }
    } catch (err: any) {
      setTaskError(err.response?.data?.message || 'Failed to update task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickToggleComplete = async (task: Task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await api.put(`/tasks/${task.id}`, { status: newStatus });
      fetchProjectDetails();
    } catch (err) {
      console.error('Failed to toggle task status:', err);
    }
  };

  const handleDeleteTaskSubmit = async () => {
    if (!selectedTask) return;
    try {
      setSubmitting(true);
      const res = await api.delete(`/tasks/${selectedTask.id}`);
      if (res.data.success) {
        setIsDeleteTaskOpen(false);
        fetchProjectDetails();
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullHeight message="Loading project details..." />;
  }

  if (!project) {
    return (
      <div className="p-8 text-center glass-panel rounded-2xl">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Project Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">This project does not exist or you do not have permission.</p>
        <Link
          to="/projects"
          className="mt-4 inline-flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
        >
          <ArrowLeft size={14} />
          <span>Back to Projects</span>
        </Link>
      </div>
    );
  }

  // Filter tasks
  const filteredTasks = (project.tasks || []).filter((task) => {
    const matchesSearch = task.name.toLowerCase().includes(searchTask.toLowerCase());
    const matchesStatus = statusFilter ? task.status === statusFilter : true;
    const matchesPriority = priorityFilter ? task.priority === priorityFilter : true;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Back to All Projects</span>
      </Link>

      {/* Project Overview Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {project.name}
              </h1>
              <Badge type="status" value={project.status} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-3xl">
              {project.description || 'No description provided for this project.'}
            </p>
          </div>

          <button
            onClick={handleOpenCreateTask}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
          >
            <Plus size={16} />
            <span>Add Task to Project</span>
          </button>
        </div>

        {/* Timeline & Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-slate-400" />
            <span>Start: {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not Set'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-slate-400" />
            <span>Due: {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not Set'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-slate-400" />
            <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-2">
          <ProgressBar progress={project.stats?.progressPercentage || 0} size="md" />
        </div>
      </div>

      {/* Task Section Header & Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Project Tasks</h2>
            <p className="text-xs text-slate-500">
              Showing {filteredTasks.length} of {project.tasks?.length || 0} tasks
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-panel p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTask}
              onChange={(e) => setSearchTask(e.target.value)}
              placeholder="Search tasks in this project..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <div className="glass-panel p-10 text-center rounded-3xl border border-slate-200/80 dark:border-slate-800">
            <p className="text-xs text-slate-400">No tasks found matching your criteria.</p>
            <button
              onClick={handleOpenCreateTask}
              className="mt-3 px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
            >
              Add First Task
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTasks.map((task) => {
              const isCompleted = task.status === 'Completed';
              return (
                <div
                  key={task.id}
                  className={`glass-panel p-4 rounded-2xl border transition-all duration-150 flex items-center justify-between gap-4 ${
                    isCompleted
                      ? 'border-emerald-200/60 dark:border-emerald-950/40 bg-emerald-50/20 dark:bg-emerald-950/10'
                      : 'border-slate-200/80 dark:border-slate-800 hover:border-indigo-300'
                  }`}
                >
                  {/* Left: Checkbox + Title + Description */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      onClick={() => handleQuickToggleComplete(task)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                      }`}
                      title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                    >
                      {isCompleted && <Check size={14} className="stroke-[3]" />}
                    </button>

                    <div className="min-w-0">
                      <h4
                        className={`text-xs font-bold leading-snug truncate ${
                          isCompleted
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {task.name}
                      </h4>
                      {task.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Badges + Due Date + Actions */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {task.dueDate && (
                      <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-400">
                        <Calendar size={12} />
                        <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                      </span>
                    )}
                    <Badge type="priority" value={task.priority} size="sm" />
                    <Badge type="status" value={task.status} size="sm" />

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditTask(task)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                        title="Edit Task"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteTask(task)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                        title="Delete Task"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        title="Add Task to Project"
        subtitle={`Adding task under: ${project.name}`}
      >
        <form onSubmit={handleCreateTaskSubmit} className="space-y-4">
          {taskError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-medium border border-rose-200">
              {taskError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Task Name *
            </label>
            <input
              type="text"
              required
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g. Set up OAuth and JWT authentication"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Task details and acceptance criteria..."
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as any)}
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
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value as any)}
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
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateTaskOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Add Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={isEditTaskOpen}
        onClose={() => setIsEditTaskOpen(false)}
        title="Edit Task"
      >
        <form onSubmit={handleEditTaskSubmit} className="space-y-4">
          {taskError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-medium border border-rose-200">
              {taskError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Task Name *
            </label>
            <input
              type="text"
              required
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as any)}
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
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value as any)}
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
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditTaskOpen(false)}
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
        isOpen={isDeleteTaskOpen}
        onClose={() => setIsDeleteTaskOpen(false)}
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
              onClick={() => setIsDeleteTaskOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleDeleteTaskSubmit}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 disabled:opacity-50"
            >
              {submitting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
