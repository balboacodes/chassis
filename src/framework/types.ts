export type Abstract = string | symbol | Class;

export type Class<TInstance = unknown> = {
    new (...args: unknown[]): TInstance;
} & object;
