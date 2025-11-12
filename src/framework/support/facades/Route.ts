import Router from '../../routing/Router.ts';
import { RouteDefinition } from '../../types.ts';
import Facade from './Facade.ts';

class Route {
    public static get: RouteDefinition;
    public static post: RouteDefinition;
    public static put: RouteDefinition;
    public static patch: RouteDefinition;
    public static delete: RouteDefinition;
    public static options: RouteDefinition;
    public static any: RouteDefinition;
    public static redirect(_from: string, _to: string, _status: number = 302): void {}
}

export default Facade.createProxy(Route, Router);
