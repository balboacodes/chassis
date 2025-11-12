import { Arr } from '@balboacodes/laravel-helpers';
import { type Express, type NextFunction, type Request, type Response, default as express } from 'express';
import { app } from '../support/helpers.ts';
import { Class, RouteHandler } from '../types.ts';

export default class Router {
    public router: Express = express();

    private routeMiddleware: Set<Class> = new Set();

    public get(path: string, handler: Class | RouteHandler, method?: string): void {
        this.handle('get', path, handler, method);
    }

    public any(path: string, handler: Class | RouteHandler, method?: string): void {
        this.handle('all', path, handler, method);
    }

    public post(path: string, handler: Class | RouteHandler, method?: string): void {
        void this.handle('post', path, handler, method);
    }

    public put(path: string, handler: Class | RouteHandler, method?: string): void {
        this.handle('put', path, handler, method);
    }

    public patch(path: string, handler: Class | RouteHandler, method?: string): void {
        this.handle('patch', path, handler, method);
    }

    public delete(path: string, handler: Class | RouteHandler, method?: string): void {
        this.handle('delete', path, handler, method);
    }

    public options(path: string, handler: Class | RouteHandler, method?: string): void {
        this.handle('options', path, handler, method);
    }

    public redirect(from: string, to: string, status: number = 302): void {
        this.handle('all', from, (_req: Request, res: Response) => {
            res.redirect(status, to);
        });
    }

    public middleware(middleware: Class | Class[]): this {
        middleware = Arr.wrap(middleware);

        for (const mw of middleware) {
            this.routeMiddleware.add(mw);
        }

        return this;
    }

    private handle(verb: keyof Express, path: string, handler: Class | RouteHandler, method?: string): void {
        const middleware = this.routeMiddleware
            .values()
            .toArray()
            .map((mw: Class) => (req: Request, res: Response, next: NextFunction) => {
                new mw().handle(req, res, next);
            });

        if (method === undefined) {
            this.router[verb](path, [...middleware, handler]);
            return;
        }

        const controller = app(handler as Class) as Class;
        app().singleton(controller, () => controller);

        this.router[verb](path, [
            ...middleware,
            (req: Request, res: Response, next: NextFunction) => {
                controller[method](req, res, next);
            },
        ]);
    }
}
