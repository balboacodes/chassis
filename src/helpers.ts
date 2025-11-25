import { Application } from './Application.ts';
import { Class } from './types.ts';

/**
 * Get the current application instance.
 */
export function app(): Application {
    return Application.instance;
}

/**
 * Determine if a value is a class.
 */
export function isClass(value: unknown): value is Class {
    return typeof value === 'function' && value.toString().startsWith('class ');
}
