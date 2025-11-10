import { NextFunction, Request, Response } from 'express';

export default class LogTime {
    public handle(req: Request, res: Response, next: NextFunction): any {
        console.log('Time: ', Date.now());
        next();
    }
}
