import { type Method } from '@std/http/unstable-method';
import { ChassisRequest } from '../ChassisRequest.ts';
import { App } from '../facades/App.ts';
import { Middleware } from '../middleware/Middleware.ts';
import { Class, RouteHandler, RouteStackHandler } from '../types.ts';
import { RouteRegistrar } from './RouteRegistrar.ts';

export class Route {
    /**
     * The route's method.
     */
    public method?: Method;

    /**
     * The route's path.
     */
    public path?: string;

    /**
     * The route's name.
     */
    public routeName?: string;

    /**
     * The route's stack of middleware, followed by its handler.
     */
    public routeStack?: RouteStackHandler;

    /**
     * The route's middleware.
     */
    protected routeMiddleware: Class<Middleware>[] = [];

    /**
     * The route's handler.
     */
    protected handler?: RouteHandler;

    /**
     * The route group's prefix.
     */
    protected static routeGroupPrefix?: string;

    /**
     * The route group's name.
     */
    protected static routeGroupName?: string;

    /**
     * The route group's middleware.
     */
    protected static routeGroupMiddleware: Class<Middleware>[] = [];

    /**
     * Set the route's name.
     */
    public name(name: string): Route {
        this.routeName = (Route.routeGroupName ?? '') + name;

        return this;
    }

    /**
     * Set the route's middleware.
     */
    public middleware(middleware: Class<Middleware>[]): Route {
        this.routeMiddleware.push(...middleware);

        return this;
    }

    /**
     * Set the route group's prefix.
     */
    public prefix(prefix: string): Route {
        Route.routeGroupPrefix = prefix;

        return this;
    }

    /**
     * Create a route group.
     */
    public group(fn: () => void): void {
        Route.routeGroupName = this.routeName;
        this.routeName = undefined;

        Route.routeGroupMiddleware = this.routeMiddleware;
        this.routeMiddleware = [];

        fn();

        Route.routeGroupPrefix = undefined;
        Route.routeGroupName = undefined;
        Route.routeGroupMiddleware = [];
    }

    /**
     * Register a GET route.
     */
    public get(path: string, handler: RouteHandler): void {
        this.register('GET', path, handler);
    }

    /**
     * Register a POST route.
     */
    public post(path: string, handler: RouteHandler): void {
        this.register('POST', path, handler);
    }

    /**
     * Register a PUT route.
     */
    public put(path: string, handler: RouteHandler): void {
        this.register('PUT', path, handler);
    }

    /**
     * Register a PATCH route.
     */
    public patch(path: string, handler: RouteHandler): void {
        this.register('PATCH', path, handler);
    }

    /**
     * Register a DELETE route.
     */
    public delete(path: string, handler: RouteHandler): void {
        this.register('DELETE', path, handler);
    }

    /**
     * Register a redirect route.
     */
    public redirect(from: string, to: string): void {
        this.register('GET', from, (request) => {
            const origin = new URL(request.url).origin;
            return Response.redirect(new URL(to, origin));
        });
    }

    /**
     * Build the route's stack of middleware, followed by its handler.
     */
    protected buildRouteStack(): RouteStackHandler {
        const handler: Extract<RouteHandler, (request: ChassisRequest) => Response | Promise<Response>> =
            Array.isArray(this.handler) ? this.handler[0].prototype[this.handler[1]] : this.handler;

        const middleware = [...App.getMiddleware(), ...Route.routeGroupMiddleware, ...this.routeMiddleware].reverse();
        let stack = async (request: ChassisRequest): Promise<Response> => await handler(request);

        for (const mw of middleware) {
            const currentStack = stack;
            stack = async (request: ChassisRequest) => await new mw().handle(request, currentStack);
        }

        return stack;
    }

    /**
     * Register the route with the registrar.
     */
    protected register(method: Method, path: string, handler: RouteHandler): void {
        this.method = method;
        this.path = (Route.routeGroupPrefix ?? '') + path;
        this.handler = handler;
        this.routeStack = this.buildRouteStack();

        App.resolve<RouteRegistrar>(RouteRegistrar).register(this);
    }
}
