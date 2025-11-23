import { Class } from './types.ts';

/**
 * Determine if a value is a class.
 */
export function isClass(value: unknown): value is Class {
    return typeof value === 'function' && value.toString().startsWith('class {');
}
