// prettier-ignore
import {
    array_all, array_any, array_filter, ARRAY_FILTER_USE_BOTH, array_find_key, array_flip, array_intersect_key, array_is_list, array_keys, array_map, array_merge, array_pop, array_push, array_reverse, array_shift, array_slice, array_unshift, count, empty, explode, http_build_query, isset, krsort, ksort, PHP_QUERY_RFC3986, rsort, sort, SORT_FLAG_CASE, SORT_LOCALE_STRING, SORT_NATURAL, SORT_NUMERIC, SORT_REGULAR, SORT_STRING, unset,
} from '@balboacodes/php-utils';
import { data_get, value } from './helpers';
import { Str } from './Str';

export class Arr {
    /**
     * Determine whether the given value is array accessible.
     */
    public static accessible(value: any): boolean {
        return Array.isArray(value) || (typeof value === 'object' && value !== null);
    }

    /**
     * Add an element to an array using "dot" notation if it doesn't exist.
     */
    public static add(
        array: any[] | Record<string, any>,
        key: number | string,
        value: any,
    ): any[] | Record<string, any> {
        if (Arr.get(array, key) === undefined) {
            Arr.set(array, key, value);
        }

        return array;
    }

    /**
     * Get an array item from an array using "dot" notation.
     *
     * @throws {TypeError} if value at key is not an array.
     */
    public static array(array: any[] | Record<string, any>, key?: number | string, defaultValue?: any): any[] {
        const value = Arr.get(array, key, defaultValue);

        if (!Array.isArray(value)) {
            throw new TypeError(`Array value for key [${key}] must be an array, ${typeof value} found.`);
        }

        return value;
    }

    /**
     * Get a boolean item from an array using "dot" notation.
     *
     * @throws {TypeError} if value at key is not a boolean.
     */
    public static boolean(array: any[] | Record<string, any>, key?: number | string, defaultValue?: boolean): boolean {
        const value = Arr.get(array, key, defaultValue);

        if (typeof value !== 'boolean') {
            throw new TypeError(`Array value for key [${key}] must be a boolean, ${typeof value} found.`);
        }

        return value;
    }

    /**
     * Collapse an array of arrays into a single array.
     */
    public static collapse(array: any[] | Record<string, any>): any[] | Record<string, any> {
        const results = Array.isArray(array) ? [] : {};
        let key = 0;

        for (const values of Object.values(array)) {
            if (Arr.accessible(values)) {
                (results as any)[key] = values;
                key++;
            }
        }

        return array_merge(Array.isArray(results) ? [] : {}, ...(results as any));
    }

    /**
     * Cross join the given arrays, returning all possible permutations.
     */
    public static crossJoin(...arrays: (any[] | Record<string, any>)[]): any[][] {
        let results: any[][] = [[]];

        arrays.forEach((array, index) => {
            let append = [];

            for (let product of results) {
                for (let item of Object.values(array)) {
                    const p = product.slice();
                    p[index] = item;

                    append.push(p);
                }
            }

            results = append;
        });

        return results;
    }

    /**
     * Divide an array into two arrays. One with keys and the other with values.
     */
    public static divide(array: any[] | Record<string, any>): [(number | string)[], any[]] {
        return [array_keys(array), Object.values(array)];
    }

    /**
     * Flatten a multi-dimensional associative array with dots.
     */
    public static dot(array: Record<string, any>, prepend: string = ''): Record<string, any> {
        const results: Record<string, any> = {};

        const flatten = (data: any[] | Record<string, any>, prefix: string): void => {
            for (const [key, value] of Object.entries(data)) {
                const newKey = prefix + key;

                if (Arr.accessible(value) && !empty(value)) {
                    flatten(value, newKey + '.');
                } else {
                    results[newKey] = value;
                }
            }
        };

        flatten(array, prepend);

        return results;
    }

    /**
     * Determine if all items pass the given truth test.
     */
    public static every(
        array: any[] | Record<string, any>,
        callback: (value: any, key: number | string) => boolean,
    ): boolean {
        return array_all(array, callback);
    }

    /**
     * Get all of the given array except for a specified array of keys.
     */
    public static except(
        array: any[] | Record<string, any>,
        keys: (number | string)[] | number | string,
    ): any[] | Record<string, any> {
        const copy = Array.isArray(array) ? array.slice() : structuredClone(array);

        Arr.forget(copy, keys);

        return copy;
    }

    /**
     * Determine if the given key exists in the provided array.
     */
    public static exists(array: any[] | Record<string, any>, key: number | string | null): boolean {
        if (key === null) {
            key = String(key);
        }

        return key in array;
    }

    /**
     * Return the first element in an array passing a given truth test.
     */
    public static first<TKey extends number | string, TValue, TFirstDefault>(
        array: TValue[] | Record<TKey, TValue>,
        callback?: (value: TValue, key: TKey) => boolean,
        defaultValue?: TFirstDefault | (() => TFirstDefault),
    ): TValue | TFirstDefault {
        if (callback === undefined) {
            if (empty(array)) {
                return value(defaultValue) as TFirstDefault;
            }

            return Object.values(array)[0];
        }

        const key = array_find_key(array, callback as (value: any, key: string | number) => boolean);

        return key !== null ? (array as any)[key] : (value(defaultValue) as TFirstDefault);
    }

    /**
     * Flatten a multi-dimensional array into a single level.
     */
    public static flatten(
        array: any[] | Record<string, any>,
        depth: number = Number.MAX_SAFE_INTEGER,
    ): any[] | Record<string, any> {
        const result = Array.isArray(array) ? [] : {};
        let key = 0;

        for (let item of Object.values(array)) {
            if (Arr.accessible(item)) {
                const values = depth === 1 ? Object.values(item) : Arr.flatten(item, depth - 1);

                for (const value of Object.values(values)) {
                    (result as any)[key] = value;
                    key++;
                }
            } else {
                (result as any)[key] = item;
                key++;
            }
        }

        return result;
    }

    /**
     * Get a float item from an array using "dot" notation.
     *
     * @throws {TypeError} if array value at key is not a float.
     */
    public static float(array: any[] | Record<string, any>, key?: number | string, defaultValue?: number): number {
        const value = Arr.get(array, key, defaultValue);

        if (!(typeof value === 'number' && !Number.isInteger(value))) {
            throw new TypeError(`Array value for key [${key}] must be a float, ${typeof value} found.`);
        }

        return value;
    }

    /**
     * Remove one or many array items from a given array using "dot" notation.
     */
    public static forget(array: any[] | Record<string, any>, keys: (number | string)[] | number | string): void {
        const original = array;
        keys = Array.isArray(keys) ? keys : [keys];

        if (count(keys) === 0) {
            return;
        }

        keys: for (const key of keys) {
            // if the exact key exists in the top-level, remove it
            if (Arr.exists(array, key)) {
                unset(array, key);

                continue;
            }

            const parts = explode('.', String(key));

            // clean up before each pass
            array = original;

            while (count(parts) > 1) {
                const part = array_shift(parts);

                if (isset((array as any)[part as string]) && Arr.accessible((array as any)[part as string])) {
                    array = (array as any)[part as string];
                } else {
                    continue keys;
                }
            }

            unset(array, array_shift(parts) as any);
        }
    }

    /**
     * Get the underlying array of items from the given argument.
     *
     * @throws {TypeError} If array cannot be created from items.
     */
    public static from<TValue>(items: any): TValue[] {
        try {
            if (Arr.accessible(items)) {
                return items;
            }

            return Array.from(items);
        } catch {
            throw new TypeError('Items cannot be represented by a scalar value.');
        }
    }

    /**
     * Get an item from an array using "dot" notation.
     */
    public static get(array: any[] | Record<string, any>, key?: number | string, defaultValue?: any): any {
        if (!Arr.accessible(array)) {
            return value(defaultValue);
        }

        if (key === undefined) {
            return array;
        }

        if (Arr.exists(array, key)) {
            return (array as any)[key];
        }

        if (!String(key).includes('.')) {
            return value(defaultValue);
        }

        for (const segment of explode('.', String(key))) {
            if (Arr.accessible(array) && Arr.exists(array, segment)) {
                array = (array as any)[segment];
            } else {
                return value(defaultValue);
            }
        }

        return array;
    }

    /**
     * Check if an item or items exist in an array using "dot" notation.
     */
    public static has(array: any[] | Record<string, any>, keys: (number | string)[] | number | string): boolean {
        keys = Array.isArray(keys) ? keys : [keys];

        if (array.length === 0 || keys.length === 0) {
            return false;
        }

        for (const key of keys) {
            let subKeyArray = array;

            if (Arr.exists(array, key)) {
                continue;
            }

            for (const segment of explode('.', String(key))) {
                if (Arr.accessible(subKeyArray) && Arr.exists(subKeyArray, segment)) {
                    subKeyArray = (subKeyArray as any)[segment];
                } else {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Determine if all keys exist in an array using "dot" notation.
     */
    public static hasAll(array: any[] | Record<string, any>, keys: (number | string)[] | number | string): boolean {
        keys = Array.isArray(keys) ? keys : [keys];

        if (array.length === 0 || keys.length === 0) {
            return false;
        }

        for (const key of keys) {
            if (!Arr.has(array, key)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Determine if any of the keys exist in an array using "dot" notation.
     */
    public static hasAny(array: any[] | Record<string, any>, keys: (number | string)[] | number | string): boolean {
        keys = Array.isArray(keys) ? keys : [keys];

        if (array.length === 0 || keys.length === 0) {
            return false;
        }

        for (const key of keys) {
            if (Arr.has(array, key)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get an integer item from an array using "dot" notation.
     *
     * @throws {TypeError} if value at key is not an integer.
     */
    public static integer(array: any[] | Record<string, any>, key?: number | string, defaultValue?: number): number {
        const value = Arr.get(array, key, defaultValue);

        if (!Number.isInteger(value)) {
            throw new TypeError(`Array value for key [${key}] must be an integer, ${typeof value} found.`);
        }

        return value;
    }

    /**
     * Determines if an array is associative.
     *
     * An array is "associative" if it doesn't have sequential numerical keys beginning with zero.
     */
    public static isAssoc(array: any[] | Record<string, any>): boolean {
        return !array_is_list(array);
    }

    /**
     * Determines if an array is a list.
     *
     * An array is a "list" if all array keys are sequential integers starting from 0 with no gaps in between.
     */
    public static isList(array: any[] | Record<string, any>): boolean {
        return array_is_list(array);
    }

    /**
     * Join all items using a string. The final items can use a separate glue string.
     */
    public static join(array: any[] | Record<string, any>, glue: string, finalGlue: string = ''): any {
        if (finalGlue === '') {
            return array.join(glue);
        }

        if (count(array) === 0) {
            return '';
        }

        if (count(array) === 1) {
            return Object.values(array).pop();
        }

        const finalItem = array_pop(array);

        return array.join(glue) + finalGlue + (finalItem ?? '');
    }

    /**
     * Return the last element in an array passing a given truth test.
     */
    public static last<TKey extends number | string, TValue, TLastDefault>(
        array: TValue[] | Record<TKey, TValue>,
        callback?: (value: TValue, key: TKey) => boolean,
        defaultValue?: TLastDefault | (() => TLastDefault),
    ): TValue | TLastDefault {
        if (callback === undefined) {
            return empty(array) ? (value(defaultValue) as TLastDefault) : (Object.values(array).pop() as TValue);
        }

        return Arr.first(array_reverse(array, true), callback, defaultValue);
    }

    /**
     * Run a map over each of the items in the array.
     */
    public static map(
        array: any[] | Record<string, any>,
        callback: (value: any, key?: number | string) => any,
    ): any[] | Record<string, any> {
        const keys = array_keys(array);
        let items: any[] | Record<string, any>;

        try {
            items = array_map(callback, array, keys);
        } catch {
            items = array_map(callback, array);
        }

        return items;
    }

    /**
     * Run a map over each nested chunk of items.
     */
    public static mapSpread<TKey extends number | string, TValue>(
        array: any[] | Record<TKey, any>,
        callback: (...chunk: any[]) => TValue,
    ): TValue[] | Record<TKey, TValue> {
        return Arr.map(array, function (chunk: any[] | Record<string, any>, key?: number | string) {
            if (Array.isArray(chunk)) {
                chunk.push(key);

                return callback(...chunk);
            }

            return callback(chunk, key);
        }) as TValue[] | Record<TKey, TValue>;
    }

    /**
     * Run an associative map over each of the items.
     *
     * The callback should return an object with a single key: value pair.
     */
    public static mapWithKeys<TKey extends number | string, TValue, TMapWithKeysKey extends string, TMapWithKeysValue>(
        array: TValue[] | Record<TKey, TValue>,
        callback: (value: TValue, key?: TKey) => Record<TMapWithKeysKey, TMapWithKeysValue>,
    ): Record<TMapWithKeysKey, TMapWithKeysValue> {
        const result = {} as Record<TMapWithKeysKey, TMapWithKeysValue>;

        for (const [key, value] of Object.entries(array)) {
            const assoc = callback(value, key as TKey);

            for (const [mapKey, mapValue] of Object.entries(assoc)) {
                (result as any)[mapKey] = mapValue;
            }
        }

        return result;
    }

    /**
     * Get a subset of the items from the given array.
     */
    public static only(
        array: any[] | Record<string, any>,
        keys: (number | string)[] | number | string,
    ): any[] | Record<string, any> {
        return array_intersect_key(array, array_flip(Array.isArray(keys) ? keys : [keys]));
    }

    /**
     * Partition the array into two arrays using the given callback.
     */
    public static partition<TKey extends number | string, TValue>(
        array: TValue[] | Record<TKey, TValue>,
        callback: (value: TValue, key: TKey) => boolean,
    ): [TValue[] | Record<TKey, TValue>, TValue[] | Record<TKey, TValue>] {
        const passed = Array.isArray(array) ? [] : {};
        const failed = Array.isArray(array) ? [] : {};

        Object.entries(array).forEach(([key, item]) => {
            if (callback(item, key as TKey)) {
                if (Array.isArray(passed)) {
                    passed.push(item);
                } else {
                    (passed as Record<string, any>)[key] = item;
                }
            } else {
                if (Array.isArray(failed)) {
                    failed.push(item);
                } else {
                    (failed as Record<string, any>)[key] = item;
                }
            }
        });

        return [passed as TValue[] | Record<TKey, TValue>, failed as TValue[] | Record<TKey, TValue>];
    }

    /**
     * Pluck an array of values from an array.
     */
    public static pluck(
        array: any[] | Record<string, any>,
        valueToPluck?: (number | string)[] | number | string | ((item: any) => any),
        key?: (number | string)[] | number | string | ((item: any) => number),
    ): any[] | Record<string, any> {
        const results: any[] | Record<string, any> = key === undefined ? [] : {};
        [valueToPluck, key] = Arr.explodePluckParameters(valueToPluck, key);

        for (const item of Object.values(array)) {
            const itemValue = typeof valueToPluck === 'function' ? valueToPluck(item) : data_get(item, valueToPluck);

            // If the key is undefined, we will just append the value to the result and keep
            // looping. Otherwise we will key the result using the value of the key we
            // received from the developer. Then we'll return the final result form.
            if (Array.isArray(results)) {
                results.push(itemValue);
            } else {
                const itemKey = typeof key === 'function' ? key(item) : data_get(item, key);

                results[itemKey] = itemValue;
            }
        }

        return results;
    }

    /**
     * Push an item onto the beginning of an array.
     */
    public static prepend(
        array: any[] | Record<string, any>,
        value: any,
        key?: number | string,
    ): any[] | Record<string, any> {
        if (key === undefined) {
            array_unshift(array, value);
        } else {
            (array as any)[key] = value;
        }

        return array;
    }

    /**
     * Prepend the key names of an associative array.
     */
    public static prependKeysWith(array: Record<string, any>, prependWith: string): Record<string, any> {
        return Arr.mapWithKeys(array, (item, key) => ({ [prependWith + key]: item }));
    }

    /**
     * Get a value from the array, and remove it.
     */
    public static pull(array: any[] | Record<string, any>, key: number | string, defaultValue?: any): any {
        const value = Arr.get(array, key, defaultValue);

        Arr.forget(array, key);

        return value;
    }

    /**
     * Push an item into an array using "dot" notation.
     */
    public static push(
        array: any[] | Record<string, any>,
        key?: number | string,
        ...values: any[]
    ): any[] | Record<string, any> {
        const target = Arr.array(array, key, []).slice();

        array_push(target, ...values);

        return Arr.set(array, key, target);
    }

    /**
     * Convert the array into a query string.
     */
    public static query(array: any[] | Record<string, any>): string {
        return http_build_query(array, '', '&', PHP_QUERY_RFC3986);
    }

    /**
     * Filter the array using the negation of the given callback.
     */
    public static reject(
        array: any[] | Record<string, any>,
        callback: (value: any) => boolean,
    ): any[] | Record<string, any> {
        return Arr.where(array, (value: any) => !callback(value));
    }

    /**
     * Select an array of values from an array.
     */
    public static select(
        array: any[] | Record<string, any>,
        keys: (number | string)[] | number | string,
    ): any[] | Record<string, any> {
        keys = Arr.wrap(keys);

        return Arr.map(array, (item) => {
            let result = Array.isArray(item) ? [] : {};

            for (const key of keys) {
                if (Arr.accessible(item) && Arr.exists(item, key)) {
                    (result as any)[key] = (item as any)[key];
                }
            }

            return result;
        });
    }

    /**
     * Set an array item to a given value using "dot" notation.
     *
     * If no key is given to the method, the entire array will be replaced.
     */
    public static set(
        array: any[] | Record<string, any>,
        key?: number | string,
        value?: any,
    ): any[] | Record<string, any> {
        if (key === undefined) {
            if (Array.isArray(array)) {
                array.length = 0;

                if (Array.isArray(value)) {
                    array.push(...value);
                } else {
                    array.push(value);
                }
            } else {
                Object.keys(array).forEach((key) => delete array[key]);

                array[0] = value;
            }

            return array;
        }

        const keys = explode('.', String(key));
        // Allows us to modify array in place like PHP does with &array. Setting a key on current also updates array.
        // Setting current to a new value does not.
        let current = array;

        for (let i = 0; i < keys.length - 1; i++) {
            if (count(keys) === 1) {
                break;
            }

            const key = keys[i];

            // If the key doesn't exist at this depth, we will just create an empty array
            // to hold the next value, allowing us to create the arrays to hold final
            // values at the correct depth. Then we'll keep digging into the array.
            if (!isset((current as any)[key]) || !Arr.accessible((current as any)[key])) {
                (current as any)[key] = Array.isArray(current) ? [] : {};
            }

            current = (current as any)[key];
        }

        (current as any)[keys[keys.length - 1]] = value;

        return array;
    }

    /**
     * Get the first item in the array, but only if exactly one item exists. Otherwise, throw an exception.
     *
     * @throws {Error} if array is empty.
     * @throws {Error} if array has more than one item.
     */
    public static sole(array: any[] | Record<string, any>, callback?: (value: any) => boolean): any {
        if (callback) {
            array = Arr.where(array, callback);
        }

        const length = count(array);

        if (length === 0) {
            throw new Error('Item not found');
        }

        if (length > 1) {
            throw new Error('Array has more than one item');
        }

        return Arr.first(array);
    }

    /**
     * Determine if some items pass the given truth test.
     */
    public static some(
        array: any[] | Record<string, any>,
        callback: (value: any, key: number | string) => boolean,
    ): boolean {
        return array_any(array, callback);
    }

    /**
     * Recursively sort an array by keys and values.
     */
    public static sortRecursive(
        array: any[] | Record<string, any>,
        options:
            | typeof SORT_REGULAR
            | typeof SORT_NUMERIC
            | typeof SORT_STRING
            | typeof SORT_LOCALE_STRING
            | typeof SORT_NATURAL
            | typeof SORT_FLAG_CASE
            | number = SORT_REGULAR,
        descending: boolean = false,
    ): any[] | Record<string, any> {
        for (let value of Object.values(array)) {
            if (Arr.accessible(value)) {
                value = Arr.sortRecursive(value, options, descending);
            }
        }

        if (!array_is_list(array)) {
            descending ? krsort(array, options as any) : ksort(array, options as any);
        } else {
            descending ? rsort(array, options) : sort(array, options);
        }

        return array;
    }

    /**
     * Recursively sort an array by keys and values in descending order.
     */
    public static sortRecursiveDesc(
        array: any[] | Record<string, any>,
        options:
            | typeof SORT_REGULAR
            | typeof SORT_NUMERIC
            | typeof SORT_STRING
            | typeof SORT_LOCALE_STRING
            | typeof SORT_NATURAL
            | typeof SORT_FLAG_CASE
            | number = SORT_REGULAR,
    ): any[] | Record<string, any> {
        return Arr.sortRecursive(array, options, true);
    }

    /**
     * Get a string item from an array using "dot" notation.
     *
     * @throws {TypeError} if array value at key is not a string.
     */
    public static string(array: any[] | Record<string, any>, key?: number | string, defaultValue?: string): string {
        const value = Arr.get(array, key, defaultValue);

        if (typeof value !== 'string') {
            throw new TypeError(`Array value for key [${key}] must be a string, ${typeof value} found.`);
        }

        return value;
    }

    /**
     * Take the first or last {limit} items from an array.
     */
    public static take(array: any[] | Record<string, any>, limit: number): any[] | Record<string, any> {
        if (limit < 0) {
            return array_slice(array, limit, Math.abs(limit));
        }

        return array_slice(array, 0, limit);
    }

    /**
     * Compile classes from an array into a CSS class list.
     */
    public static toCssClasses(array: string[] | Record<string, boolean | string> | string): string {
        const classList = Arr.wrap(array);
        const classes: string[] = [];

        for (const [className, constraint] of Object.entries(classList)) {
            if (!isNaN(Number(className))) {
                classes.push(constraint);
            } else if (constraint) {
                classes.push(className);
            }
        }

        return classes.join(' ');
    }

    /**
     * Compile styles from an array into a style list.
     */
    public static toCssStyles(array: any[] | Record<string, boolean | string> | string): string {
        const styleList = Arr.wrap(array);
        const styles = [];

        for (const [style, constraint] of Object.entries(styleList)) {
            if (!isNaN(Number(style))) {
                styles.push(Str.finish(constraint, ';'));
            } else if (constraint) {
                styles.push(Str.finish(style, ';'));
            }
        }

        return styles.join(' ');
    }

    /**
     * Convert a flatten "dot" notation array into an expanded array.
     */
    public static undot(array: Record<string, any>): Record<string, any> {
        const results: Record<string, any> = {};

        for (const [key, value] of Object.entries(array)) {
            Arr.set(results, key, value);
        }

        return results;
    }

    /**
     * Filter the array using the given callback.
     */
    public static where(
        array: any[] | Record<string, any>,
        callback: (value: any, key?: number | string) => boolean,
    ): any[] | Record<string, any> {
        return array_filter(array, callback, ARRAY_FILTER_USE_BOTH);
    }

    /**
     * Filter items where the value is not undefined.
     */
    public static whereNotUndefined(array: any[] | Record<string, any>): any[] | Record<string, any> {
        return Arr.where(array, (value) => value !== undefined);
    }

    /**
     * If the given value is not an array and not undefined, wrap it in one.
     */
    public static wrap(value: any): any[] {
        if (value === undefined || value === null) {
            return [];
        }

        return Arr.accessible(value) ? value : [value];
    }

    /**
     * Explode the "value" and "key" arguments passed to "pluck".
     */
    protected static explodePluckParameters(
        value?: (number | string)[] | number | string | ((item: any) => any),
        key?: (number | string)[] | number | string | ((item: any) => number),
    ): [
        (number | string)[] | number | ((item: any) => any) | undefined,
        (number | string)[] | ((item: any) => any) | undefined,
    ] {
        value = typeof value === 'string' ? explode('.', value) : value;
        key = key === undefined || Array.isArray(key) || typeof key === 'function' ? key : explode('.', String(key));

        return [value, key];
    }
}
