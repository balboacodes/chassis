import { type Route as RouteType } from '@std/http/unstable-route';
import { ChassisRequest } from '../ChassisRequest.ts';
import { Route } from './Route.ts';

export class RouteRegistrar {
    /**
     * The routes that have been registered.
     */
    protected routes: Map<string | number, RouteType> = new Map();

    /**
     * Get the routes that have been registered.
     */
    public getRoutes(): Map<string | number, RouteType> {
        return this.routes;
    }

    /**
     * Get the values for the routes that have been registered.
     */
    public getRoutesValues(): RouteType[] {
        return this.routes.values().toArray();
    }

    /**
     * Register a route.
     */
    public register(route: Route): void {
        this.routes.set(route.routeName ?? this.routes.size + 1, {
            method: route.method,
            pattern: new URLPattern({ pathname: this.normalizePath(route.path!) }),
            handler: async (req, params, info) => {
                const chassisRequest = new ChassisRequest(req, params, info);

                return await route.routeStack!(chassisRequest);
            },
        });
    }

    /**
     * Normalize a path.
     */
    protected normalizePath(path: string): string {
        path = path.trim();

        if (!path.startsWith('/')) {
            path = `/${path}`;
        }

        return `${path}{/}?`;
    }
}
