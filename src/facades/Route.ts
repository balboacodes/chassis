import { Middleware } from '../middleware/Middleware.ts';
import { Route as RealRoute } from '../routing/Route.ts';
import { Class, RouteHandler } from '../types.ts';

export const Route = new Proxy(
    class Route {
        // @ts-expect-error:
        public prefix(_prefix: string): RealRoute {}
        // @ts-expect-error:
        public static name(_name: string): RealRoute {}
        // @ts-expect-error:
        public static middleware(_middleware: Class<Middleware>[]): RealRoute {}
        public static group(_fn: () => void): void {}
        public static get(_path: string, _handler: RouteHandler): void {}
        public static post(_path: string, _handler: RouteHandler): void {}
        public static put(_path: string, _handler: RouteHandler): void {}
        public static patch(_path: string, _handler: RouteHandler): void {}
        public static delete(_path: string, _handler: RouteHandler): void {}
        public static redirect(_from: string, _to: string): void {}
    },
    {
        get(_target, method) {
            // @ts-ignore:
            return (...args: unknown[]) => new RealRoute()[method](...args);
        },
    },
);
