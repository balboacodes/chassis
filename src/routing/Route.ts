import { type Method } from '@std/http/unstable-method';
import { app } from '../helpers.ts';
import { RouteHandler } from '../types.ts';
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
     * The route's handler.
     */
    public handler?: RouteHandler;

    /**
     * The route's name.
     */
    public routeName?: string;

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
     * Set a route name.
     */
    public name(name: string): Route {
        this.routeName = name;

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
     * Register a route.
     */
    protected register(method: Method, path: string, handler: RouteHandler): void {
        this.method = method;
        this.path = path;
        this.handler = handler;
        this.registrar.register(this);
    }
}
