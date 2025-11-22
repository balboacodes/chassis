export type Abstract = string | symbol;

export type Class<TInstance = unknown> = {
    new (...args: unknown[]): TInstance;
} & object;
