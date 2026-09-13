import prisma from '../config/prisma';

export async function logAudit(
  userId: string,
  action: string,
  entityType: 'PROJECT' | 'TASK' | 'AUTH' | 'SYSTEM',
  entityId?: string,
  details?: Record<string, any>
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId: entityId || null,
        details: details ? JSON.stringify(details) : null
      }
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}
