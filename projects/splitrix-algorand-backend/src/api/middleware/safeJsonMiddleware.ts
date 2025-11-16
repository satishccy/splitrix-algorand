import { Request, Response, NextFunction } from 'express';
import { safeJson } from '../../utils/safeJson';

/**
 * Middleware to convert BigInt values to numbers in JSON responses
 * This ensures all responses can be properly serialized to JSON
 */
export function safeJsonMiddleware(req: Request, res: Response, next: NextFunction) {
  // Store the original json method
  const originalJson = res.json.bind(res);

  // Override the json method to process the response through safeJson
  res.json = function (body: any) {
    // Process the body through safeJson to convert BigInt values
    const safeBody = safeJson(body);
    // Call the original json method with the safe body
    return originalJson(safeBody);
  };

  next();
}

