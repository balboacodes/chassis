import Router from '../../Router.ts';
import { Class, ResourceActions, RouteDefinition } from '../../types.ts';
import Facade from './Facade.ts';

/**
 * @see Router
 */
class Route {
    public static get: RouteDefinition;
    public static post: RouteDefinition;
    public static put: RouteDefinition;
    public static patch: RouteDefinition;
    public static delete: RouteDefinition;
    public static options: RouteDefinition;
    public static any: RouteDefinition;
    // @ts-expect-error
    public static redirect(from: string, to: string, status: number = 302): void {}
    // @ts-expect-error
    public static view(path: string, view: string, data?: Record<string, any>): void {}
    // @ts-expect-error
    public static middleware(middleware: Class | Class[]): Router {}
    // @ts-expect-error
    public static name(name: string): Router {}
    // @ts-expect-error
    public static controller(controller: Class): Router {}
    // @ts-expect-error
    public static prefix(prefix: string): Router {}
    // @ts-expect-error
    public static group(routes: () => void): void {}
    // @ts-expect-error
    public static resource(resource: string, controller: Class): void {}
    // @ts-expect-error
    public static only(actions: ResourceActions[]): Router {}
}

export default Facade.proxy(Route, Router);
