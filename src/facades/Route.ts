import { Middleware } from '../middleware/Middleware.ts';
import { Route as RealRoute } from '../routing/Route.ts';
import { Class, RouteHandler } from '../types.ts';
import { Facade } from './Facade.ts';

interface Route {
    /**
     * Set the route group's prefix.
     */
    prefix(prefix: string): RealRoute;
    /**
     * Set the route's name.
     */
    name(name: string): RealRoute;
    /**
     * Set the route's middleware.
     */
    middleware(middleware: Class<Middleware>[]): RealRoute;
    /**
     * Create a route group.
     */
    group(fn: () => void): void;
    /**
     * Register a GET route.
     */
    get(path: string, handler: RouteHandler): void;
    /**
     * Register a POST route.
     */
    post(path: string, handler: RouteHandler): void;
    /**
     * Register a PUT route.
     */
    put(path: string, handler: RouteHandler): void;
    /**
     * Register a PATCH route.
     */
    patch(path: string, handler: RouteHandler): void;
    /**
     * Register a DELETE route.
     */
    delete(path: string, handler: RouteHandler): void;
    /**
     * Register a redirect route.
     */
    redirect(from: string, to: string): void;
    /**
     * Register a resource route.
     */
    resource(name: string, controller: Class): void;
}

export const Route = Facade.createProxy<Route>(RealRoute);
