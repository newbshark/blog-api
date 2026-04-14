import { NextFunction, Request, Response } from 'express';

export function errorhandler(
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) {
    const message = err instanceof Error ? err.message : 'Internal server error';

    console.error(`[ERROR] ${req.method} ${req.path}:`, message);

    res.status(500).json({
        error: 'Internal server error',
    });
}