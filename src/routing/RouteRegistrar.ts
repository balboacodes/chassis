import { ChassisRequest } from "../http/ChassisRequest.ts";
import type { Route } from "./Route.ts";
import type { ChassisRouteType } from "../types.ts";

export class RouteRegistrar {
  /**
   * The routes that have been registered.
   */
  protected routes: Map<string | number, ChassisRouteType> = new Map();

  /**
   * Get the routes that have been registered.
   */
  public getRoutes(): Map<string | number, ChassisRouteType> {
    return this.routes;
  }

  /**
   * Get the values for the routes that have been registered.
   */
  public getRoutesValues(): ChassisRouteType[] {
    return this.routes.values().toArray();
  }

  /**
   * Register a route.
   */
  public register(route: Route): void {
    this.routes.set(route.routeName ?? this.routes.size + 1, {
      method: route.method,
      pattern: new URLPattern({ pathname: this.normalizePath(route.path!) }),
      handler: async (request, params, info) => {
        const chassisRequest = new ChassisRequest(request, params, info);

        return await route.routeStack!(chassisRequest);
      },
    });
  }

  /**
   * Normalize a path.
   */
  protected normalizePath(path: string): string {
    path = path.trim();

    if (!path.startsWith("/")) {
      path = `/${path}`;
    }

    return `${path}{/}?`;
  }
}
