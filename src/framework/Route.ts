import { NextFunction, Request, Response } from 'express';
import App from './App.js';
import { app } from './support/helpers.js';
import { Class, Verb } from './types.js';

export default class Route {
    public static get(
        path: string,
        handler: Class | ((req: Request, res: Response, next: NextFunction) => any),
        method?: string,
    ): void {
        Route.handle('get', path, handler, method);
    }

    public static post(
        path: string,
        handler: Class | ((req: Request, res: Response, next: NextFunction) => any),
        method?: string,
    ): void {
        Route.handle('post', path, handler, method);
    }

    public static put(
        path: string,
        handler: Class | ((req: Request, res: Response, next: NextFunction) => any),
        method?: string,
    ): void {
        Route.handle('put', path, handler, method);
    }

    public static patch(
        path: string,
        handler: Class | ((req: Request, res: Response, next: NextFunction) => any),
        method?: string,
    ): void {
        Route.handle('patch', path, handler, method);
    }

    public static delete(
        path: string,
        handler: Class | ((req: Request, res: Response, next: NextFunction) => any),
        method?: string,
    ): void {
        Route.handle('delete', path, handler, method);
    }

    private static handle(
        verb: Verb,
        path: string,
        handler: Class | ((req: Request, res: Response, next: NextFunction) => any),
        method?: string,
    ): void {
        if (method === undefined) {
            app().router[verb](path, handler as (req: Request, res: Response, next: NextFunction) => any);

            return;
        }

        const controller = App.make<Class>(handler as Class);

        if (!App.bound(controller)) {
            App.singleton(controller, () => controller);
        }

        app().router[verb](path, (req: Request, res: Response, next: NextFunction) => {
            controller[method](req, res, next);
        });
    }
}
