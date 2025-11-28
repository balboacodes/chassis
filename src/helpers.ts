import { App } from './facades/App.ts';
import { Config } from './facades/Config.ts';
import { RouteRegistrar } from './routing/RouteRegistrar.ts';
import { Class } from './types.ts';

/**
 * Determine if a value is a class.
 */
export function isClass(value: unknown): value is Class {
    return typeof value === 'function' && value.toString().startsWith('class ');
}

/**
 * Parse the `APP_KEY` `.env` variable into a `CryptoKey`.
 */
export async function parseAppKey(): Promise<CryptoKey> {
    const keyBase64 = Config.get<string>('app.key');
    const buffer = Uint8Array.fromBase64(keyBase64).buffer;

    return await crypto.subtle.importKey(
        'raw',
        buffer,
        { name: 'HMAC', hash: 'SHA-256' },
        true,
        ['sign', 'verify'],
    );
}

/**
 * Get a named route.
 */
export function route(name: string, parameters?: Record<string, number | string>) {
    const routes = App.resolve<RouteRegistrar>('chassis.route-registrar').getRoutes();

    let route = routes.get(name)?.pattern.pathname;

    for (const [parameter, value] of Object.entries(parameters ?? {})) {
        route = route?.replace(`:${parameter}`, String(value));
    }

    // Remove optional trailing slash and any parameters not replaced
    route = route?.replace('{/}?', '').replaceAll(/\/:\w+\??|\?/g, '');

    return route;
}
