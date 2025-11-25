import { type Method } from '@std/http/unstable-method';
import { type Route as RouteType } from '@std/http/unstable-route';
import { ChassisRequest } from '../ChassisRequest.ts';
import { Class } from '../types.ts';

export type RouteHandler = [Class, string] | ((request: ChassisRequest) => Response | Promise<Response>);

export class RouteRegistrar {
    /**
     * Routes that have been registered.
     */
    protected routes: RouteType[] = [];

    /**
     * Get the routes.
     */
    public getRoutes(): RouteType[] {
        return this.routes;
    }

    /**
     * Register a route.
     */
    public register(method: Method, path: string, handler: RouteHandler): void {
        this.routes.push({
            method,
            pattern: new URLPattern({ pathname: this.normalizePath(path) }),
            handler: async (req, params, _info) => {
                const chassisRequest = new ChassisRequest(req, params);

                if (Array.isArray(handler)) {
                    // @ts-ignore: handler[1] is a method on the controller
                    return await new handler[0]()[handler[1]](chassisRequest);
                }

                return await handler(chassisRequest);
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
