import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const getAuditLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { limit = '20' } = req.query;

    const logs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string, 10)
    });

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error: any) {
    console.error('Audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit logs.'
    });
  }
};
