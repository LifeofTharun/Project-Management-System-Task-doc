import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, logout, getMe } from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validate';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Validation chains
const registerValidation = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Endpoints
router.post('/register', authRateLimiter, registerValidation, handleValidationErrors, register);
router.post('/login', authRateLimiter, loginValidation, handleValidationErrors, login);
router.post('/logout', authenticateJWT, logout);
router.get('/me', authenticateJWT, getMe);

export default router;
