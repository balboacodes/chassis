import { Class } from '../../types.ts';
import { app } from '../helpers.ts';

export default class Facade {
    public static proxy<T extends Class>(className: T, binding: Class | string): T {
        return new Proxy(className, {
            get(_target: Class, property: string | symbol) {
                return Facade.__callStatic(binding, property);
            },
        }) as T;
    }

    public static __callStatic(binding: Class | string, property: string | symbol): Function {
        return (...args: any[]) => app(binding)[property](...args);
    }
}
