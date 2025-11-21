import { array_unshift } from '@balboacodes/php-utils';
import Arr from '../support/Arr.ts';
import Collection from '../support/Collection.ts';

export default class Repository {
    /**
     * All of the configuration items.
     */
    protected items: Record<string, unknown> = {};

    /**
     * Create a new configuration repository.
     */
    public constructor(items: Record<string, unknown> = {}) {
        this.items = items;
    }

    /**
     * Determine if the given configuration value exists.
     */
    public has(key: string): boolean {
        return Arr.has(this.items, key);
    }

    /**
     * Get the specified configuration value.
     */
    public get(key: Record<string, unknown> | string, defaultValue?: unknown): Record<string, unknown> | unknown {
        if (typeof key === 'object') {
            return this.getMany(key);
        }

        return Arr.get(this.items, key, defaultValue);
    }

    /**
     * Get many configuration values.
     */
    public getMany(keys: Record<string, unknown>): Record<string, unknown> {
        const config = {} as Record<string, unknown>;

        for (const [key, defaultValue] of Object.entries(keys)) {
            config[key] = Arr.get(this.items, key, defaultValue);
        }

        return config;
    }

    /**
     * Get the specified string configuration value.
     *
     * @throws {TypeError} if value at key is not a string.
     */
    public string(key: string, defaultValue?: (() => string | null) | string): string {
        const value = this.get(key, defaultValue);

        if (typeof value !== 'string') {
            throw new TypeError(`Configuration value for key [${key}] must be a string, ${typeof value} given.`);
        }

        return value;
    }

    /**
     * Get the specified integer configuration value.
     *
     * @throws {TypeError} if value at key is not an integer.
     */
    public integer(key: string, defaultValue?: (() => number | null) | number): number {
        const value = this.get(key, defaultValue);

        if (!Number.isInteger(value)) {
            throw new TypeError(`Configuration value for key [${key}] must be an integer, ${typeof value} given.`);
        }

        return value as number;
    }

    /**
     * Get the specified float configuration value.
     *
     * @throws {TypeError} if value at key is not a float.
     */
    public float(key: string, defaultValue?: (() => number | null) | number): number {
        const value = this.get(key, defaultValue);

        if (
            typeof value !== 'number' ||
            (typeof value === 'number' && Number.isInteger(value))
        ) {
            throw new TypeError(`Configuration value for key [${key}] must be a float, ${typeof value} given.`);
        }

        return value;
    }

    /**
     * Get the specified boolean configuration value.
     *
     * @throws {TypeError} if value at key is not a boolean.
     */
    public boolean(key: string, defaultValue?: (() => boolean | null) | boolean): boolean {
        const value = this.get(key, defaultValue);

        if (typeof value !== 'boolean') {
            throw new TypeError(`Configuration value for key [${key}] must be a boolean, ${typeof value} given.`);
        }

        return value;
    }

    /**
     * Get the specified array configuration value.
     *
     * @throws {TypeError} if value at key is not a array.
     */
    public array(key: string, defaultValue?: (() => unknown[] | null) | unknown[]): unknown[] {
        const value = this.get(key, defaultValue);

        if (!Array.isArray(value)) {
            throw new TypeError(`Configuration value for key [${key}] must be an array, ${typeof value} given.`);
        }

        return value;
    }

    /**
     * Get the specified array configuration value as a collection.
     */
    public collection(key: string, defaultValue?: (() => unknown[] | null) | unknown[]): Collection<number, unknown> {
        return new Collection(this.array(key, defaultValue)) as Collection<number, unknown>;
    }

    /**
     * Set a given configuration value.
     */
    public set(key: Record<string, unknown> | string, value?: unknown): void {
        const keys = typeof key === 'object' ? key : { key: value };

        for (const [key, value] of Object.entries(keys)) {
            Arr.set(this.items, key, value);
        }
    }

    /**
     * Prepend a value onto an array configuration value.
     */
    public prepend(key: string, value: unknown): void {
        const array = this.get(key, []) as unknown[];

        array_unshift(array, value);

        this.set(key, array);
    }

    /**
     * Push a value onto an array configuration value.
     */
    public push(key: string, value: unknown): void {
        const array = this.get(key, []) as unknown[];

        array.push(value);

        this.set(key, array);
    }

    /**
     * Get all of the configuration items for the application.
     */
    public all(): Record<string, unknown> {
        return this.items;
    }
}
