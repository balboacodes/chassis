import Router from '../../Router.ts';
import { Class, RouteDefinition } from '../../types.ts';
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
    public static middleware(middleware: Class | Class[]): Router {}
    // @ts-expect-error
    public static name(name: string): Router {}
}

export default Facade.proxy(Route, Router);
