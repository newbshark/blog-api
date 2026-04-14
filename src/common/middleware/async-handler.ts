import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRouteHandler<P = any, ResBody = any, ReqBody = any, ReqQuery = any> =(
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction
) => Promise<unknown>;

export const asynchandler = <P = any, ResBody = any, ReqBody = any, ReqQuery = any> (
    fn: AsyncRouteHandler<P, ResBody, ReqBody, ReqQuery>
    ): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};  