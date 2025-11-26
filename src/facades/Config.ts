import { Config as RealConfig } from '../Config.ts';
import { app } from '../helpers.ts';

export const Config = new Proxy(
    class Config {
        // @ts-expect-error:
        public static get<T = unknown>(_key?: string): T {}
        // @ts-expect-error:
        public static set(_key?: string): unknown {}
    },
    {
        get(_target, method) {
            // @ts-ignore:
            return (...args: unknown[]) => app().resolve<RealConfig>(RealConfig)[method](...args);
        },
    },
);
