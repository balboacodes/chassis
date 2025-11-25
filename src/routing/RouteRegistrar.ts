import { type Route as RouteType } from '@std/http/unstable-route';
import { ChassisRequest } from '../ChassisRequest.ts';
import { Class } from '../types.ts';
import { Route } from './Route.ts';

export type RouteHandler = [Class, string] | ((request: ChassisRequest) => Response | Promise<Response>);

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

                if (Array.isArray(route.handler!)) {
                    const controller = new route.handler[0]();
                    const method = route.handler[1];
                    // @ts-ignore:
                    return await controller[method](chassisRequest);
                }

                return await route.handler!(chassisRequest);
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
