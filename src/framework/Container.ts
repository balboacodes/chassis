import 'reflect-metadata';
import { Class } from './types.js';

export type Factory<T = any> = (container: Container) => T;

export class Container {
    private bindings: Map<string | Class, Factory<any>> = new Map<string | Class, Factory>();

    private singletons: Map<string | Class, any> = new Map<string | Class, any>();

    public bind<T>(key: string | Class, factory: Factory<T>): void {
        this.bindings.set(key, factory);
    }

    public singleton<T>(key: string | Class, factory: Factory<T>): void {
        this.bindings.set(key, factory);
        this.singletons.set(key, null);
    }

    public make<T>(key: string | Class<T>): T {
        if (this.singletons.has(key)) {
            const instance = this.singletons.get(key);

            if (instance) return instance;

            const newInstance = this.resolve(key);
            this.singletons.set(key, newInstance);

            return newInstance;
        }

        return this.resolve(key);
    }

    /**
     *
     * @throws {Error} If key is a string and it hasn't been bound to the container.
     */
    private resolve<T>(key: string | Class<T>): T {
        if (this.bindings.has(key)) {
            return this.bindings.get(key)!(this);
        }

        if (typeof key === 'string') {
            throw new Error(`${key} is a string and it hasn't been bound to the container.`);
        }

        // Key is a class, so we'll resolve all its dependencies and return a new instance
        const paramTypes: any[] = Reflect.getMetadata('design:paramtypes', key) ?? [];
        const dependencies = paramTypes.map((dep) => this.make(dep));

        return new key(...dependencies);
    }
}
