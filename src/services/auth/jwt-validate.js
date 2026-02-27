import jwt from 'jsonwebtoken';

export function authenticate(accessToken)  {
    accessToken = accessToken?.split(' ')?.[1];
    if (!accessToken) {
        return;
    }
    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
        console.log(decoded);
        return decoded.userId;
    } catch (e) {
        console.log(e);
    }
}
