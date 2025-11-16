import type { NextFunction, Request, Response } from 'express';

export default class LogTime {
    public handle(_req: Request, _res: Response, next: NextFunction): void {
        // console.log(Date.now());
        next();
    }
}
