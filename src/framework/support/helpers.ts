import Config from '../Config.js';
import Container from '../Container.js';
import { Class } from '../types.js';

/**
 * @returns The container instance if abstract is undefined, otherwise the resolved binding.
 */
export function app(abstract?: Class | string): any {
    if (abstract === undefined) {
        return Container.getInstance();
    }

    return Container.getInstance()?.make(abstract);
}

/**
 * If an object is passed as the key, we will assume you want to set an object of values.
 *
 * @returns The config repository is key is undefined, the value at key if it is a string, or void if an object was
 * provided.
 */
export function config(key?: string | Record<string, any>, defaultValue?: any): any {
    const repository = app(Config) as Class<Config>;

    if (key === undefined) {
        return repository as any;
    }

    if (typeof key === 'string') {
        return repository.get(key, defaultValue);
    }

    return repository.set(key);
}
