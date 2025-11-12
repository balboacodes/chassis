import { Arr } from '@balboacodes/laravel-helpers';
import { type Express, type NextFunction, type Request, type Response, default as express } from 'express';
import { app } from '../support/helpers.ts';
import { Class, RouteHandler } from '../types.ts';

/**
 * Bound
 */
export default class Router {
    public router: Express = express();

    private routeMiddleware: Set<Class> = new Set();

    public middleware(middleware: Class | Class[]): this {
        middleware = Arr.wrap(middleware);

        for (const mw of middleware) {
            this.routeMiddleware.add(mw);
        }

        return this;
    }

    public get(path: string, handler: Class | RouteHandler, method?: string): void {
        this.register('get', path, handler, method);
    }

    public post(path: string, handler: Class | RouteHandler, method?: string): void {
        this.register('post', path, handler, method);
    }

    public put(path: string, handler: Class | RouteHandler, method?: string): void {
        this.register('put', path, handler, method);
    }

    public patch(path: string, handler: Class | RouteHandler, method?: string): void {
        this.register('patch', path, handler, method);
    }

    public delete(path: string, handler: Class | RouteHandler, method?: string): void {
        this.register('delete', path, handler, method);
    }

    public options(path: string, handler: Class | RouteHandler, method?: string): void {
        this.register('options', path, handler, method);
    }

    public any(path: string, handler: Class | RouteHandler, method?: string): void {
        this.register('all', path, handler, method);
    }

    public redirect(from: string, to: string, status: number = 302): void {
        this.register('all', from, (_req: Request, res: Response): void => {
            res.redirect(status, to);
        });
    }

    public registerGlobalMiddleware(handler: RouteHandler) {
        this.router.use(handler);
    }

    public listen(port: number, hostname: string, callback?: (error?: Error) => void): void {
        this.router.listen(
            port,
            hostname,
            callback ??
                (() => {
                    console.log(`🚀 Server running at http://${hostname}:${port}`);
                }),
        );
    }

    private register(verb: keyof Express, path: string, handler: Class | RouteHandler, method?: string) {
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
                controller[method!](req, res, next);
            },
        ]);

        this.routeMiddleware.clear();
    }
}
