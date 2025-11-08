import Container from './Container.js';

export type Class<T = any> = {
    new (...args: any[]): T;
    [key: string]: any;
};

/**
 * @throws {Error} If controller could not be resolved from the container or method does not exist on the controller.
 */
export type Route = (routePath: string, controllerOrHandler: Class | Function, methodName?: string) => void;

export type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

export type Factory<T = any> = (container: Container) => T;
