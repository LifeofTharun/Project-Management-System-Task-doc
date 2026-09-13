import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projectController';
import { authenticateJWT } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validate';

const router = Router();

// Protect all project routes with JWT authentication
router.use(authenticateJWT);

const createProjectValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project Name is required')
    .isLength({ max: 150 })
    .withMessage('Project Name must not exceed 150 characters'),
  body('description')
    .optional({ nullable: true })
    .isString()
    .withMessage('Description must be text'),
  body('status')
    .optional()
    .isIn(['Not Started', 'In Progress', 'Completed'])
    .withMessage('Status must be one of: Not Started, In Progress, Completed'),
  body('startDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Start date must be a valid ISO date'),
  body('endDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('End date must be a valid ISO date')
];

const updateProjectValidation = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Project ID is required in URL parameter'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project Name cannot be empty')
    .isLength({ max: 150 })
    .withMessage('Project Name must not exceed 150 characters'),
  body('description')
    .optional({ nullable: true })
    .isString()
    .withMessage('Description must be text'),
  body('status')
    .optional()
    .isIn(['Not Started', 'In Progress', 'Completed'])
    .withMessage('Status must be one of: Not Started, In Progress, Completed'),
  body('startDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Start date must be a valid ISO date'),
  body('endDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('End date must be a valid ISO date')
];

const projectIdParamValidation = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Project ID is required')
];

// Endpoints
router.get('/', getProjects);
router.get('/:id', projectIdParamValidation, handleValidationErrors, getProjectById);
router.post('/', createProjectValidation, handleValidationErrors, createProject);
router.put('/:id', updateProjectValidation, handleValidationErrors, updateProject);
router.delete('/:id', projectIdParamValidation, handleValidationErrors, deleteProject);

export default router;
