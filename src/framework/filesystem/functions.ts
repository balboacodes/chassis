import { ltrim, unset } from '@balboacodes/php-utils';
import { SEPARATOR } from '@std/path';

/**
 * Join the given paths together.
 */
export function join_paths(basePath?: string, ...paths: string[]): string {
    for (const [index, path] of Object.entries(paths)) {
        if (path === '') {
            unset(paths, Number(index));
        } else {
            paths[Number(index)] = `${SEPARATOR}${ltrim(path, SEPARATOR)}`;
        }
    }

    return basePath + paths.join('');
}
