export type Class<T = any> = {
    new (...args: any[]): T;
    [key: string]: any;
};
