import type { NextFunction, Response } from 'express';
import { Request } from '../../../framework/index.ts';

export default class LogTime {
    public handle(_req: Request, _res: Response, next: NextFunction): void {
        // console.log(Date.now());
        next();
    }
}
