import { SEPARATOR } from '@std/path';
import { empty, ltrim, unset } from '@balboacodes/php-utils';

/**
 * Join the given paths together.
 */
export function join_paths(basePath: string, ...paths: string[]): string {
    for (const [index, path] of Object.entries(paths)) {
        if (empty(path) && path !== '0') {
            unset(paths, index);
        } else {
            paths[Number(index)] = SEPARATOR + ltrim(path, SEPARATOR);
        }
    }

    return basePath + paths.join('');
}
