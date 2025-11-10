import { NextFunction, Request, Response } from 'express';
import { config } from '../../../src/framework/support/helpers.js';

export default class LogAppName {
    public handle(req: Request, res: Response, next: NextFunction): any {
        console.log(config('app.name'));
        next();
    }
}
