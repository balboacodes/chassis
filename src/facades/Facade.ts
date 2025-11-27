import { App } from '../App.ts';
import { Abstract } from '../types.ts';

export abstract class Facade {
    /**
     * Create a proxy for the given container binding.
     */
    public static create<T>(abstract: Abstract): T {
        return new Proxy({}, {
            get(_target, method) {
                // @ts-ignore:
                return (...args: unknown[]) => App.getInstance().resolve<T>(abstract)[method](...args);
            },
        }) as T;
    }
}
