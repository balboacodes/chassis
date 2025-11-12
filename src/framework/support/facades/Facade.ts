import { Class } from '../../types.ts';
import { app } from '../helpers.ts';

export default class Facade {
    public static createProxy<T extends Class>(className: T, binding: Class | string): T {
        return new Proxy(className, {
            get(_target: Class, property: string | symbol) {
                return (...args: any[]) => app(binding)[property](...args);
            },
        }) as T;
    }
}
