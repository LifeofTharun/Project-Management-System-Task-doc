import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { logAudit } from '../utils/auditLogger';

export const getTasks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { projectId, status, priority, search, sortBy = 'createdAt', sortOrder = 'desc', page, limit } = req.query;

    const whereClause: any = {
      userId
    };

    if (projectId && typeof projectId === 'string' && projectId.trim() !== '') {
      whereClause.projectId = projectId.trim();
    }

    if (status && typeof status === 'string' && status.trim() !== '') {
      whereClause.status = status.trim();
    }

    if (priority && typeof priority === 'string' && priority.trim() !== '') {
      whereClause.priority = priority.trim();
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      whereClause.name = {
        contains: search.trim()
      };
    }

    const validSortFields = ['name', 'priority', 'status', 'dueDate', 'createdAt', 'updatedAt'];
    const orderByField = validSortFields.includes(sortBy as string) ? (sortBy as string) : 'createdAt';
    const orderDirection = (sortOrder as string).toLowerCase() === 'asc' ? 'asc' : 'desc';

    const take = limit ? parseInt(limit as string, 10) : undefined;
    const skip = page && take ? (parseInt(page as string, 10) - 1) * take : undefined;

    const [total, tasks] = await Promise.all([
      prisma.task.count({ where: whereClause }),
      prisma.task.findMany({
        where: whereClause,
        orderBy: {
          [orderByField]: orderDirection
        },
        skip,
        take,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              status: true
            }
          }
        }
      })
    ]);

    res.status(200).json({
      success: true,
      data: tasks,
      meta: {
        total,
        page: page ? parseInt(page as string, 10) : 1,
        limit: take || total,
        totalPages: take ? Math.ceil(total / take) : 1
      }
    });
  } catch (error: any) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tasks.'
    });
  }
};

export const getTaskById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    });

    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found.'
      });
      return;
    }

    if (task.userId !== userId) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this task.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error: any) {
    console.error('Get task by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve task details.'
    });
  }
};

export const createTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, description, priority = 'Medium', status = 'Pending', dueDate, projectId } = req.body;

    // Verify project exists and belongs to current user
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found.'
      });
      return;
    }

    if (project.userId !== userId) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You cannot add tasks to another user’s project.'
      });
      return;
    }

    const task = await prisma.task.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        userId
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    await logAudit(userId, 'CREATE_TASK', 'TASK', task.id, {
      name: task.name,
      projectId: task.projectId,
      status: task.status
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: task
    });
  } catch (error: any) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task.'
    });
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { name, description, priority, status, dueDate, projectId } = req.body;

    const existingTask = await prisma.task.findUnique({
      where: { id }
    });

    if (!existingTask) {
      res.status(404).json({
        success: false,
        message: 'Task not found.'
      });
      return;
    }

    if (existingTask.userId !== userId) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only modify your own tasks.'
      });
      return;
    }

    if (projectId && projectId !== existingTask.projectId) {
      const newProject = await prisma.project.findUnique({
        where: { id: projectId }
      });
      if (!newProject || newProject.userId !== userId) {
        res.status(403).json({
          success: false,
          message: 'Access denied. Target project does not belong to you.'
        });
        return;
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description ? description.trim() : null }),
        ...(priority !== undefined && { priority }),
        ...(status !== undefined && { status }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(projectId !== undefined && { projectId })
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    await logAudit(userId, 'UPDATE_TASK', 'TASK', updatedTask.id, {
      name: updatedTask.name,
      status: updatedTask.status,
      priority: updatedTask.priority
    });

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      data: updatedTask
    });
  } catch (error: any) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task.'
    });
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existingTask = await prisma.task.findUnique({
      where: { id }
    });

    if (!existingTask) {
      res.status(404).json({
        success: false,
        message: 'Task not found.'
      });
      return;
    }

    if (existingTask.userId !== userId) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own tasks.'
      });
      return;
    }

    await prisma.task.delete({
      where: { id }
    });

    await logAudit(userId, 'DELETE_TASK', 'TASK', id, {
      name: existingTask.name
    });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully.'
    });
  } catch (error: any) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task.'
    });
  }
};
