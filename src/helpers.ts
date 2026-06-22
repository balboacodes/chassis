import { App } from "./facades/App.ts";
import type { RouteRegistrar } from "./routing/RouteRegistrar.ts";
import type { Class } from "./types.ts";

/**
 * Determine if a value is a class.
 */
export function isClass(value: unknown): value is Class {
  return typeof value === "function" && value.toString().startsWith("class ");
}

/**
 * Get a named route.
 */
export function route(
  name: string,
  parameters?: Record<string, number | string>,
): string {
  const routes = App.resolve<RouteRegistrar>("chassis.route-registrar")
    .getRoutes();

  let route = routes.get(name)?.pattern.pathname;

  if (route === undefined) {
    throw new Error(`No route exists with the name: ${name}`);
  }

  for (const [parameter, value] of Object.entries(parameters ?? {})) {
    route = route.replace(`:${parameter}`, String(value));
  }

  // Remove optional trailing slash, any parameters not replaced, and any remaining question marks
  route = route.replace("{/}?", "").replaceAll(/\/:\w+\??|\?/g, "");

  return route;
}
