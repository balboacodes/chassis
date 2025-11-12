import { Class } from '../../types.ts';
import { app } from '../helpers.ts';

export default class Facade {
    public static createProxy(className: Class, accessor: Class | string): Class {
        return new Proxy(className, {
            get(_target: Class, property: string | symbol) {
                return (...args: any[]) => app(accessor)[property](...args);
            },
        });
    }
}
