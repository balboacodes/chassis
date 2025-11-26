import { type Method } from '@std/http/unstable-method';
import { ChassisRequest } from '../ChassisRequest.ts';
import { app } from '../helpers.ts';
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
     * The route's handler.
     */
    protected handler?: RouteHandler;

    /**
     * The route's middleware.
     */
    protected routeMiddleware: Class<Middleware>[] = [];

    /**
     * Create a new route instance.
     */
    public constructor(
        /**
         * The application's route registrar.
         */
        protected registrar: RouteRegistrar = app().resolve(RouteRegistrar),
    ) {}

    /**
     * Set the route's name.
     */
    public name(name: string): Route {
        this.routeName = name;

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

        const middleware = [...app().getMiddleware(), ...this.routeMiddleware].reverse();
        let stack = async (request: ChassisRequest): Promise<Response> => await handler(request);

        for (const mw of middleware) {
            const oldStack = stack;
            stack = async (request: ChassisRequest) => await new mw().handle(request, oldStack);
        }

        return stack;
    }

    /**
     * Register the route with the registrar.
     */
    protected register(method: Method, path: string, handler: RouteHandler): void {
        this.method = method;
        this.path = path;
        this.handler = handler;
        this.routeStack = this.buildRouteStack();
        this.registrar.register(this);
    }
}
