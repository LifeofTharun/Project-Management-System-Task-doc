import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed. Please check your inputs.',
      errors: errors.array().map(err => ({
        field: 'path' in err ? err.path : (err as any).param,
        message: err.msg
      }))
    });
    return;
  }
  next();
};
