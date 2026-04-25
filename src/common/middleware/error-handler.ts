import { NextFunction, Request, Response } from 'express';
import { LoggerService } from '../logger/index.js';

const logger = new LoggerService();

export function errorhandler(
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    logger.error(`[ERROR] ${req.method} ${req.path}:`, message);
    

    res.status(500).json({
        error: 'Internal server error',
    });
}