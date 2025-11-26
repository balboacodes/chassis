import { Application } from '../Application.ts';
import { Abstract } from '../types.ts';

export abstract class Facade {
    /**
     * Create a proxy for the given container binding, or the application instance if not provided.
     */
    public static createProxy<T>(abstract?: Abstract): T {
        return new Proxy({}, {
            get(_target, method) {
                return (...args: unknown[]) =>
                    abstract === undefined
                        // @ts-ignore:
                        ? Application.getInstance()[method](...args)
                        // @ts-ignore:
                        : Application.getInstance().resolve<T>(abstract)[method](...args);
            },
        }) as T;
    }
}
