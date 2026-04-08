import { authenticate } from '../../services/auth/jwt-validate.js';
import { Request, Response, NextFunction } from 'express';

export async function jwtValidationMiddleware(req: Request,
                                              res: Response,
                                              next: NextFunction) {
    const headers = req.headers;
    let accessToken = headers.authorization;
    const userId = authenticate(accessToken);

    if (!userId) {
        res.status(401).send({
            message: 'Authentication failed your token is invalid or missing',
            statusCode: 401,
        });
    } else {
        req.user = {
            id: userId,
        };
        next();
    }
}
