import { Arr } from '@balboacodes/laravel-helpers';
import type { Express, NextFunction, Request, Response } from 'express';
import { app } from './support/helpers.js';
import { Class } from './types/types.js';

export default class Route {
    private routeMiddleware: Set<Class> = new Set();

    public middleware(middleware: Class | Class[]): this {
        middleware = Arr.wrap(middleware);

        for (const mw of middleware) {
            this.routeMiddleware.add(mw);
        }

        return this;
    }

    public any(
        path: string,
        handler: Class | ((req: Request, res: Response, next: NextFunction) => any),
        method?: string,
    ): void {
        this.handle('all', path, handler, method);
    }

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
        void this.handle('post', path, handler, method);
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

    public options(
        path: string,
        handler: Class | ((req: Request, res: Response, next: NextFunction) => any),
        method?: string,
    ): void {
        this.handle('options', path, handler, method);
    }

    private handle(
        verb: keyof Express,
        path: string,
        handler: Class | ((req: Request, res: Response, next: NextFunction) => any),
        method?: string,
    ): void {
        const middleware = this.routeMiddleware
            .values()
            .toArray()
            .map((mw: Class) => (req: Request, res: Response, next: NextFunction) => {
                new mw().handle(req, res, next);
            });

        if (method === undefined) {
            app().router[verb](path, [...middleware, handler]);
            return;
        }

        const controller = app(handler as Class) as Class;

        app().router[verb](path, [
            ...middleware,
            (req: Request, res: Response, next: NextFunction) => {
                controller[method](req, res, next);
            },
        ]);
    }
}
