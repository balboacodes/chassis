import { ChassisRequest } from '../ChassisRequest.ts';
import { app } from '../helpers.ts';
import { Class } from '../types.ts';
import { RouteRegistrar } from './RouteRegistrar.ts';

export type RouteHandler = [Class, string] | ((request: ChassisRequest) => Response | Promise<Response>);

export class Route {
    /**
     * Route name.
     */
    protected routeName?: string;

    /**
     * Set a route name.
     */
    public name(name: string): Route {
        const route = new Route();
        route.routeName = name;

        return route;
    }

    /**
     * Register a GET route.
     */
    public get(path: string, handler: RouteHandler): void {
        app().resolve<RouteRegistrar>(RouteRegistrar).register('GET', path, handler);
    }

    /**
     * Register a POST route.
     */
    public post(path: string, handler: RouteHandler): void {
        app().resolve<RouteRegistrar>(RouteRegistrar).register('POST', path, handler);
    }

    /**
     * Register a PUT route.
     */
    public put(path: string, handler: RouteHandler): void {
        app().resolve<RouteRegistrar>(RouteRegistrar).register('PUT', path, handler);
    }

    /**
     * Register a PATCH route.
     */
    public patch(path: string, handler: RouteHandler): void {
        app().resolve<RouteRegistrar>(RouteRegistrar).register('PATCH', path, handler);
    }

    /**
     * Register a DELETE route.
     */
    public delete(path: string, handler: RouteHandler): void {
        app().resolve<RouteRegistrar>(RouteRegistrar).register('DELETE', path, handler);
    }

    /**
     * Register a redirect route.
     */
    public redirect(from: string, to: string): void {
        app().resolve<RouteRegistrar>(RouteRegistrar).register('GET', from, (request) => {
            const origin = new URL(request.url).origin;
            return Response.redirect(new URL(to, origin));
        });
    }
}
