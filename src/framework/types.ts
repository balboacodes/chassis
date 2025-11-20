export type Class<TInstance = unknown> = {
    new (...args: unknown[]): TInstance;
} & object;
