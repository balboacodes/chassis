import { NextFunction, Request, Response } from 'express';
import Application from './Application.js';
import { Class, Verb } from './types.js';

export default class Route {
    public constructor(private app: Application) {}

    public get(
        path: string,
        handler: Class | ((req: Request, res: Response, next: NextFunction) => any),
        method?: string,
    ): void {
        this.handle('get', path, handler, method);
    }

    public post(
        path: string,
        handler: Class | ((req: Request, res: Response, next: NextFunction) => any),
        method?: string,
    ): void {
        this.handle('post', path, handler, method);
    }

    public put(
        path: string,
        handler: Class | ((req: Request, res: Response, next: NextFunction) => any),
        method?: string,
    ): void {
        this.handle('put', path, handler, method);
    }

    public patch(
        path: string,
        handler: Class | ((req: Request, res: Response, next: NextFunction) => any),
        method?: string,
    ): void {
        this.handle('patch', path, handler, method);
    }

    public delete(
        path: string,
        handler: Class | ((req: Request, res: Response, next: NextFunction) => any),
        method?: string,
    ): void {
        this.handle('delete', path, handler, method);
    }

    private handle(
        verb: Verb,
        path: string,
        handler: Class | ((req: Request, res: Response, next: NextFunction) => any),
        method?: string,
    ): void {
        if (method === undefined) {
            this.app.router[verb](path, handler as (req: Request, res: Response, next: NextFunction) => any);

            return;
        }

        const controller = Application.make(handler as Class);

        this.app.router[verb](path, (req: Request, res: Response, next: NextFunction) => {
            controller[method](req, res, next);
        });
    }
}
