declare global {
    namespace Express {
        interface Request {
            user?: JwtUser;
        }
    }
}

export interface JwtUser {
    id: number;
}
 