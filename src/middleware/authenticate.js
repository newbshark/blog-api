import {authenticate} from '../services/auth/jwt-validate.js';

export async function jwtValidationMiddleware(req, res, next) {
    const headers = req.headers;
    let accessToken = headers.authorization;
    const userId = authenticate(accessToken);

    if (!userId) {
        res.status(401).send({
            message: 'Authentication failed your token is invalid or missing',
            statusCode: 401,
            anyCustomData: '...',
        });
        return;
    } else {
        // USER ID ЕСТЬ!
        req.user = {
            id: userId,
        };
        next();
    }
}
