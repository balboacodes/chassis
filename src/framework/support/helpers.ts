import App from '../App.ts';
import Config from '../Config.ts';
import Container from '../Container.ts';
import Router from '../Router.ts';
import { Class } from '../types.ts';

export function app<T extends Class | string | undefined = undefined>(
    binding?: T,
): T extends Class ? InstanceType<T> : T extends string ? any : App {
    if (binding === undefined) {
        return Container.getInstance() as any;
    }

    return Container.getInstance().make(binding);
}

/**
 * If an object is passed as the key, we will assume you want to set an object of values.
 */
export function config<T extends string | Record<string, any> | undefined = undefined>(
    key?: T,
    defaultValue?: any,
): T extends string ? any : T extends Record<string, any> ? void : Config {
    const repository = app(Config);

    if (key === undefined) {
        return repository as any;
    }

    if (typeof key === 'string') {
        return repository.get(key, defaultValue);
    }

    return repository.set(key) as any;
}

export function route(name: string, parameters: Record<string, number | string> = {}): string | undefined {
    let path = app(Router).routeNames.get(name);

    for (const [key, value] of Object.entries(parameters)) {
        path = path?.replace(`:${key}`, String(value));
    }

    return path;
}

/**
 * Check if value is a class.
 */
export function isClass<T>(value: unknown): value is Class<T> {
    return typeof value === 'function' && /^class(\s|{)/.test(value.toString());
}
