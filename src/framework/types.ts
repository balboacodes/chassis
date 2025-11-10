import Container from './Container.js';

export type Class<T = any> = {
    new (...args: any[]): T;
    [key: string]: any;
};

export type Factory<T = any> = (container: Container) => T;

export type Verb = 'get' | 'post' | 'put' | 'patch' | 'delete';
