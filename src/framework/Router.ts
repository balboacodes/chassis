import { Arr } from '@balboacodes/laravel-helpers';
import { type Express, type NextFunction, type Request, type Response, default as express } from 'express';
import { default as nodePath } from 'node:path';
import Container from './Container.ts';
import { app, isClass } from './support/helpers.ts';
import { Class, ErrorHandler, RouteHandler } from './types.ts';

export default class Router {
    public router: Express = express();

    public routeNames: Map<string, string> = new Map();

    private routeName?: string;

    private routeMiddleware: Set<Class> = new Set();

    public middleware(middleware: Class | Class[]): this {
        middleware = Arr.wrap(middleware);

        for (const mw of middleware) {
            this.routeMiddleware.add(mw);
        }

        return this;
    }

    public name(name: string): this {
        this.routeName = name;
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

    public view(path: string, view: string, _data?: Record<string, any>): void {
        this.register('get', path, (_req: Request, res: Response): void => {
            res.sendFile(nodePath.join(process.cwd(), `../src/resources/views/${view}.html`));

            // Prod
            // res.sendFile(nodePath.join(process.cwd(), `/resources/views/${view}.html`));
            // or
            // res.render(view, data));
        });
    }

    public registerGlobalMiddleware(handler: RouteHandler | ErrorHandler) {
        this.router.use(handler);
    }

    public listen(port: number, hostname: string, callback?: (error?: Error) => void): void {
        this.router.listen(
            port,
            hostname,
            callback ??
                ((error?: Error) => {
                    if (error) {
                        throw error;
                    }

                    console.log(`🚀 Server running at http://${hostname}:${port}`);
                }),
        );
    }

    /**
     * Convert Laravel-style route definitions to Express-style.
     *
     * Example: {foo}/{bar?}/{baz?} -> :foo{/:bar}{/:baz}
     */
    private convertPath(path: string): string {
        return (
            path
                // normal param {foo} -> :foo
                .replaceAll(/{\w+}/g, (match) => `:${match.replace('{', '').replace('}', '')}`)
                // optional param /{foo?} -> {/:foo}
                .replaceAll(/\/{\w+\?}/g, (match) => match.replace('/{', '{/:').replace('?', ''))
        );
    }

    private setRouteNames(path: string): void {
        if (this.routeName !== undefined) {
            this.routeNames.set(this.routeName, path);
            this.routeName = undefined;
        }
    }

    private getMiddlewareHandlers(): RouteHandler[] {
        return this.routeMiddleware
            .values()
            .toArray()
            .map((mw) => (req: Request, res: Response, next: NextFunction): void => {
                new mw().handle(req, res, next);
            });
    }

    private register(verb: keyof Express, path: string, handler: Class | RouteHandler, method?: string) {
        path = this.convertPath(path);

        this.setRouteNames(path);

        const middleware = this.getMiddlewareHandlers();

        if (method === undefined) {
            this.router[verb](path, [...middleware, handler]);
            this.routeMiddleware.clear();

            return;
        }

        const controller = app(handler as Class) as Class;
        app().singleton(controller, () => controller, false);

        this.router[verb](path, [
            ...middleware,
            (req: Request, res: Response) => {
                Container.inject(
                    controller,
                    (paramTypes: any[]) => {
                        const dependencies = paramTypes.map((dep) => (isClass(dep) ? app(dep) : undefined));
                        controller[method](req, res, ...dependencies);
                    },
                    () => {
                        controller[method](req, res);
                    },
                    method,
                );
            },
        ]);

        this.routeMiddleware.clear();
    }
}
