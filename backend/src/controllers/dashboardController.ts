import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Run parallel queries for maximum performance
    const [
      totalProjects,
      projectsInProgress,
      projectsCompleted,
      projectsNotStarted,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      highPriorityTasks,
      mediumPriorityTasks,
      lowPriorityTasks,
      recentProjects,
      recentTasks
    ] = await Promise.all([
      prisma.project.count({ where: { userId } }),
      prisma.project.count({ where: { userId, status: 'In Progress' } }),
      prisma.project.count({ where: { userId, status: 'Completed' } }),
      prisma.project.count({ where: { userId, status: 'Not Started' } }),
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: 'Completed' } }),
      prisma.task.count({ where: { userId, status: 'Pending' } }),
      prisma.task.count({ where: { userId, status: 'In Progress' } }),
      prisma.task.count({ where: { userId, priority: 'High' } }),
      prisma.task.count({ where: { userId, priority: 'Medium' } }),
      prisma.task.count({ where: { userId, priority: 'Low' } }),
      prisma.project.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          _count: { select: { tasks: true } }
        }
      }),
      prisma.task.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          project: { select: { id: true, name: true } }
        }
      })
    ]);

    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const projectCompletionRate = totalProjects > 0 ? Math.round((projectsCompleted / totalProjects) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
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
        taskPriorityBreakdown: {
          high: highPriorityTasks,
          medium: mediumPriorityTasks,
          low: lowPriorityTasks
        },
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
        recentProjects,
        recentTasks
      }
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard metrics.'
    });
  }
};
