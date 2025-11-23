import { Class } from './types.ts';

export function isClass(value: unknown): value is Class {
    return typeof value === 'function' && value.toString().startsWith('class {');
}
