import { Config as RealConfig } from '../Config.ts';
import { Facade } from './Facade.ts';

interface Config {
    /**
     * Get an item from the config.
     */
    get<T = unknown>(key?: string): T;
    /**
     * Set a config item.
     */
    set(key?: string): unknown;
}

export const Config = Facade.createProxy<Config>(RealConfig);
