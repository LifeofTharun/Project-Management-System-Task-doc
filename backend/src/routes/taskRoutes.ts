import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController';
import { authenticateJWT } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validate';

const router = Router();

// Protect all task routes with JWT authentication
router.use(authenticateJWT);

const createTaskValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Task Name is required')
    .isLength({ max: 150 })
    .withMessage('Task Name must not exceed 150 characters'),
  body('projectId')
    .trim()
    .notEmpty()
    .withMessage('Project ID is required'),
  body('description')
    .optional({ nullable: true })
    .isString()
    .withMessage('Description must be text'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be one of: Low, Medium, High'),
  body('status')
    .optional()
    .isIn(['Pending', 'In Progress', 'Completed'])
    .withMessage('Status must be one of: Pending, In Progress, Completed'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Due date must be a valid ISO date')
];

const updateTaskValidation = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Task ID is required'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task Name cannot be empty')
    .isLength({ max: 150 })
    .withMessage('Task Name must not exceed 150 characters'),
  body('description')
    .optional({ nullable: true })
    .isString()
    .withMessage('Description must be text'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be one of: Low, Medium, High'),
  body('status')
    .optional()
    .isIn(['Pending', 'In Progress', 'Completed'])
    .withMessage('Status must be one of: Pending, In Progress, Completed'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Due date must be a valid ISO date'),
  body('projectId')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project ID cannot be empty')
];

const taskIdParamValidation = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Task ID is required')
];

// Endpoints
router.get('/', getTasks);
router.get('/:id', taskIdParamValidation, handleValidationErrors, getTaskById);
router.post('/', createTaskValidation, handleValidationErrors, createTask);
router.put('/:id', updateTaskValidation, handleValidationErrors, updateTask);
router.delete('/:id', taskIdParamValidation, handleValidationErrors, deleteTask);

export default router;
