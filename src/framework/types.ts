export type Abstract = string | symbol | Class;

export type Class<TInstance = unknown> = {
    // deno-lint-ignore no-explicit-any
    new (...args: any[]): TInstance;
} & object;
