import Router from '../../routing/Router.ts';
import { app } from '../helpers.ts';

class Route {}

export default new Proxy(Route, {
    get(_target, property) {
        return (...args: any[]) => app(Router)[property](...args);
    },
});
