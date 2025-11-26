import { Arr } from '@balboacodes/laravel-helpers';

export class Config {
    /**
     * Create a new config instance.
     */
    public constructor(
        /**
         * The config items.
         */
        protected items: Record<string, unknown> = {},
    ) {}

    /**
     * Get an item from the config.
     */
    public get<T = unknown>(key?: string): T {
        return Arr.get(this.items, key);
    }

    /**
     * Set a config item.
     */
    public set(key?: string): unknown {
        return Arr.set(this.items, key);
    }
}
