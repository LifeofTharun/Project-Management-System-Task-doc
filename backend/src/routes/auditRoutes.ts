import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);
router.get('/', getAuditLogs);

export default router;
