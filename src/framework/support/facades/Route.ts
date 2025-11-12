import Router from '../../routing/Router.ts';
import { Class, RouteHandler } from '../../types.ts';
import Facade from './Facade.ts';

class Route {
    public static get(_path: string, _handler: Class | RouteHandler, _method?: string): void {}
}

export default Facade.createProxy(Route, Router);
