import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { logAudit } from '../utils/auditLogger';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
      return;
    }

    // Hash password with bcrypt (12 rounds)
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'fallback-secret-key-development';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign({ id: user.id, email: user.email }, secret, {
      expiresIn: expiresIn as any
    });

    await logAudit(user.id, 'USER_REGISTERED', 'AUTH', user.id, {
      email: user.email
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        token,
        user
      }
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register account. Please try again later.'
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email address or password.'
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email address or password.'
      });
      return;
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'fallback-secret-key-development';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign({ id: user.id, email: user.email }, secret, {
      expiresIn: expiresIn as any
    });

    await logAudit(user.id, 'USER_LOGGED_IN', 'AUTH', user.id, {
      email: user.email
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to authenticate user.'
    });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (req.user) {
      await logAudit(req.user.id, 'USER_LOGGED_OUT', 'AUTH', req.user.id);
    }
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed.'
    });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized.'
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            projects: true,
            tasks: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile.'
    });
  }
};
