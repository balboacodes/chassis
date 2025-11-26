import { type Route as RouteType } from '@std/http/unstable-route';
import { ChassisRequest } from '../ChassisRequest.ts';
import { app } from '../helpers.ts';
import { Route } from './Route.ts';

export class RouteRegistrar {
    /**
     * Routes that have been registered.
     */
    protected routes: Map<string | number, RouteType> = new Map();

    /**
     * Get the routes values.
     */
    public getRoutes(): Map<string | number, RouteType> {
        return this.routes;
    }

    /**
     * Get the routes values.
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
            handler: async (req, params, _info) => {
                const chassisRequest = new ChassisRequest(req, params);
                const handler = Array.isArray(route.handler)
                    ? route.handler[0].prototype[route.handler[1]]
                    : route.handler;

                const middleware = [...app().middleware, ...route.routeMiddleware].reverse();
                let stack = async (request: ChassisRequest): Promise<Response> => {
                    return await handler(request);
                };

                for (const mw of middleware) {
                    const oldStack = stack;

                    stack = async (request: ChassisRequest) => {
                        return await new mw().handle(request, oldStack);
                    };
                }

                return await stack(chassisRequest);
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
