import App from '../App.js';
import Config from '../Config.js';
import { Class } from '../types.js';

export function app<T extends Class | string | undefined = undefined>(abstract?: T): T extends undefined ? App : any {
    if (abstract === undefined) {
        return App.getInstance() as any;
    }

    return App.make(abstract);
}

/**
 * If an object is passed as the key, we will assume you want to set an object of values.
 */
export function config<T extends string | Record<string, any> | undefined = undefined>(
    key?: T,
    defaultValue?: any,
): T extends undefined ? Config : T extends string ? any : void {
    const repository = app(Config) as Config;

    if (key === undefined) {
        return repository as any;
    }

    if (typeof key === 'string') {
        return repository.get(key, defaultValue);
    }

    return repository.set(key) as any;
}
