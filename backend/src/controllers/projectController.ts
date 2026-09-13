import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { logAudit } from '../utils/auditLogger';

export const getProjects = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { search, status, sortBy = 'createdAt', sortOrder = 'desc', page, limit } = req.query;

    const whereClause: any = {
      userId
    };

    if (search && typeof search === 'string' && search.trim() !== '') {
      whereClause.name = {
        contains: search.trim()
      };
    }

    if (status && typeof status === 'string' && status.trim() !== '') {
      whereClause.status = status.trim();
    }

    const validSortFields = ['name', 'status', 'startDate', 'endDate', 'createdAt', 'updatedAt'];
    const orderByField = validSortFields.includes(sortBy as string) ? (sortBy as string) : 'createdAt';
    const orderDirection = (sortOrder as string).toLowerCase() === 'asc' ? 'asc' : 'desc';

    const take = limit ? parseInt(limit as string, 10) : undefined;
    const skip = page && take ? (parseInt(page as string, 10) - 1) * take : undefined;

    const [total, projects] = await Promise.all([
      prisma.project.count({ where: whereClause }),
      prisma.project.findMany({
        where: whereClause,
        orderBy: {
          [orderByField]: orderDirection
        },
        skip,
        take,
        include: {
          tasks: {
            select: {
              id: true,
              name: true,
              status: true,
              priority: true,
              dueDate: true
            }
          },
          _count: {
            select: {
              tasks: true
            }
          }
        }
      })
    ]);

    const formattedProjects = projects.map(proj => {
      const totalTasks = proj.tasks.length;
      const completedTasks = proj.tasks.filter(t => t.status === 'Completed').length;
      const inProgressTasks = proj.tasks.filter(t => t.status === 'In Progress').length;
      const pendingTasks = proj.tasks.filter(t => t.status === 'Pending').length;
      const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...proj,
        stats: {
          totalTasks,
          completedTasks,
          inProgressTasks,
          pendingTasks,
          progressPercentage
        }
      };
    });

    res.status(200).json({
      success: true,
      data: formattedProjects,
      meta: {
        total,
        page: page ? parseInt(page as string, 10) : 1,
        limit: take || total,
        totalPages: take ? Math.ceil(total / take) : 1
      }
    });
  } catch (error: any) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve projects.'
    });
  }
};

export const getProjectById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { tasks: true }
        }
      }
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
        message: 'Access denied. You do not own this project.'
      });
      return;
    }

    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(t => t.status === 'Completed').length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        ...project,
        stats: {
          totalTasks,
          completedTasks,
          progressPercentage
        }
      }
    });
  } catch (error: any) {
    console.error('Get project by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve project details.'
    });
  }
};

export const createProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, description, status = 'Not Started', startDate, endDate } = req.body;

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        status,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        userId
      }
    });

    await logAudit(userId, 'CREATE_PROJECT', 'PROJECT', project.id, {
      name: project.name,
      status: project.status
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      data: project
    });
  } catch (error: any) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project.'
    });
  }
};

export const updateProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { name, description, status, startDate, endDate } = req.body;

    const existingProject = await prisma.project.findUnique({
      where: { id }
    });

    if (!existingProject) {
      res.status(404).json({
        success: false,
        message: 'Project not found.'
      });
      return;
    }

    if (existingProject.userId !== userId) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only modify your own projects.'
      });
      return;
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description ? description.trim() : null }),
        ...(status !== undefined && { status }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null })
      }
    });

    await logAudit(userId, 'UPDATE_PROJECT', 'PROJECT', updatedProject.id, {
      name: updatedProject.name,
      status: updatedProject.status
    });

    res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      data: updatedProject
    });
  } catch (error: any) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project.'
    });
  }
};

export const deleteProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existingProject = await prisma.project.findUnique({
      where: { id }
    });

    if (!existingProject) {
      res.status(404).json({
        success: false,
        message: 'Project not found.'
      });
      return;
    }

    if (existingProject.userId !== userId) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own projects.'
      });
      return;
    }

    await prisma.project.delete({
      where: { id }
    });

    await logAudit(userId, 'DELETE_PROJECT', 'PROJECT', id, {
      name: existingProject.name
    });

    res.status(200).json({
      success: true,
      message: 'Project and all its associated tasks deleted successfully.'
    });
  } catch (error: any) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project.'
    });
  }
};
