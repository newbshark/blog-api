import jwt, { JwtPayload } from 'jsonwebtoken';

export function authenticate(accessToken: string | undefined): number {
    accessToken = accessToken?.split(' ')?.[1];
    if (!accessToken) {
        throw new Error('Access token is missing');
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (jwtSecret === undefined) {
        console.error('JWT_SECRET is not defined in environment variables');
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    try {
        const decoded = jwt.verify(accessToken, jwtSecret) as JwtPayload;
        console.log(decoded);

        return decoded['userId'];
    } catch (e) {
        console.log(e);
        throw new Error('Invalid access token');
    }
}
