import { FILTER_VALIDATE_BOOLEAN, filter_var, intval } from '@balboacodes/php-utils';
import { Express, default as express, NextFunction, Response } from 'express';
import { default as nodePath } from 'node:path';
import Container from './Container.ts';
import Arr from './support/Arr.ts';
import { app, isClass } from './support/helpers.ts';
import Str from './support/Str.ts';
import Stringable from './support/Stringable.ts';
import type { Class, Request, ResourceActions, RouteHandler } from './types.ts';

export default class Router {
    public router: Express = express();

    public routeNames: Map<string, string> = new Map();

    private routeName?: string;

    private routeMiddleware: Set<Class> = new Set();

    private isGroup = false;

    private groupPrefix?: string;

    private groupRouteName?: string;

    private groupController?: Class;

    private resourceGroupActions: ResourceActions[] = ['index', 'create', 'store', 'show', 'edit', 'update', 'destroy'];

    private resourceGroupRoutes = {
        index: () => this.name('index').get('', 'index'),
        create: () => this.name('create').get('/create', 'create'),
        store: () => this.name('store').post('', 'store'),
        show: () => this.name('show').get('/{resource}', 'show'),
        edit: () => this.name('edit').get('/{resource}/edit', 'edit'),
        update: () => this.name('update').patch('/{resource}', 'update'),
        destroy: () => this.name('destroy').delete('/{resource}', 'destroy'),
    };

    public constructor() {
        Object.defineProperties(this.router.request, {
            all: {
                value: function (): {} {
                    return { ...this.query, ...this.body, file: this.file, files: this.files };
                },
            },
            input: {
                value: function (key: string, defaultValue?: any): any {
                    const inputs = { ...this.query, ...this.body, file: this.file, files: this.files };

                    return inputs[key] ?? defaultValue;
                },
            },
            string: {
                value: function (key: string, defaultValue?: any): Stringable {
                    return Str.of(this.input(key ?? defaultValue));
                },
            },
            integer: {
                value: function (key: string, defaultValue = 0): number {
                    return intval(this.input(key, defaultValue));
                },
            },
            boolean: {
                value: function (key: string, defaultValue = false): boolean {
                    return filter_var(this.input(key, defaultValue), FILTER_VALIDATE_BOOLEAN);
                },
            },
            date: {
                value: function (key: string): Date | null {
                    const input = this.input(key);
                    if (!input) return null;

                    const parsed = Date.parse(input);
                    return Number.isNaN(parsed) ? null : new Date(parsed);
                },
            },
        });
    }

    public registerGlobalMiddleware(handler: RouteHandler) {
        // @ts-ignore
        this.router.use((req: Request, res: Response, next: NextFunction) => {
            handler(req, res, next);
        });
    }

    public middleware(middleware: Class | Class[]): this {
        middleware = Arr.wrap(middleware);

        for (const mw of middleware) {
            this.routeMiddleware.add(mw);
        }

        return this;
    }

    public prefix(prefix: string): this {
        this.groupPrefix = `/${prefix}`;
        return this;
    }

    public name(name: string): this {
        this.routeName = name;
        return this;
    }

    public controller(name: Class): this {
        this.groupController = name;
        return this;
    }

    public only(actions: ResourceActions[]): this {
        this.resourceGroupActions = actions;
        return this;
    }

    public group(routes: () => void): void {
        this.isGroup = true;
        this.groupRouteName = this.routeName;
        this.routeName = undefined;

        routes();

        this.resetGroup();
    }

    public get(path: string, handler: Class | RouteHandler | string, method?: string): void {
        this.register('get', path, handler, method);
    }

    public post(path: string, handler: Class | RouteHandler | string, method?: string): void {
        this.register('post', path, handler, method);
    }

    public put(path: string, handler: Class | RouteHandler | string, method?: string): void {
        this.register('put', path, handler, method);
    }

    public patch(path: string, handler: Class | RouteHandler | string, method?: string): void {
        this.register('patch', path, handler, method);
    }

    public delete(path: string, handler: Class | RouteHandler | string, method?: string): void {
        this.register('delete', path, handler, method);
    }

    public options(path: string, handler: Class | RouteHandler | string, method?: string): void {
        this.register('options', path, handler, method);
    }

    public any(path: string, handler: Class | RouteHandler | string, method?: string): void {
        this.register('all', path, handler, method);
    }

    public redirect(from: string, to: string, status: number = 302): void {
        this.register('get', from, (_req: Request, res: Response): void => {
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

    public resource(resource: string, controller: Class): void {
        this.prefix(resource)
            .name(`${resource}.`)
            .controller(controller)
            .group(() => {
                for (const action of this.resourceGroupActions) {
                    this.resourceGroupRoutes[action]();
                }
            });
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

    private register(verb: keyof Express, path: string, handler: Class | RouteHandler | string, method?: string) {
        path = (this.groupPrefix ?? '') + this.convertPath(path);

        this.setRouteName(path);

        const middleware = this.getMiddlewareHandlers();

        if (this.groupController) {
            method = handler as string;
            handler = this.groupController;
        }

        if (method === undefined) {
            this.router[verb](path, [
                ...middleware,
                (req: Request, res: Response) => {
                    (handler as RouteHandler)(req, res);
                },
            ]);
            this.resetRoute();
            return;
        }

        const controller = app(handler as Class) as Class;

        if (!app().bound(controller)) {
            app().singleton(controller, () => controller, false);
        }

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

        this.resetRoute();
    }

    /**
     * Convert Laravel-style route definitions to Express-style.
     *
     * Example: {foo}/{bar?}/{baz?} -> :foo{/:bar}{/:baz}
     */
    private convertPath(path: string): string {
        return path
            .replaceAll(/{\w+}/g, (match) => `:${match.replace('{', '').replace('}', '')}`) // {foo} -> :foo
            .replaceAll(/\/{\w+\?}/g, (match) => match.replace('/{', '{/:').replace('?', '')); // /{foo?} -> {/:foo}
    }

    private getMiddlewareHandlers(): RouteHandler[] {
        return this.routeMiddleware
            .values()
            .toArray()
            .map((mw) => (req: Request, res: Response, next: NextFunction): void => {
                new mw().handle(req, res, next);
            });
    }

    private setRouteName(path: string): void {
        if (this.routeName) {
            this.routeNames.set((this.groupRouteName ?? '') + this.routeName, path);
        }
    }

    private resetRoute(): void {
        if (!this.isGroup) {
            this.routeMiddleware.clear();
        }

        this.routeName = undefined;
    }

    private resetGroup(): void {
        this.isGroup = false;
        this.routeMiddleware.clear();
        this.groupPrefix = undefined;
        this.groupRouteName = undefined;
        this.groupController = undefined;
        this.resourceGroupActions = ['index', 'create', 'store', 'show', 'edit', 'update', 'destroy'];
    }
}
