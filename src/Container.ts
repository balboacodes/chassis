import { Class, Factory } from './types.js';

export default class Container {
    private static instance: Container;

    private bindings = new Map<Class | string, Factory>();

    private singletons = new Map<Class | string, any>();

    public static getInstance(): Container {
        return Container.instance;
    }

    public static setInstance(instance: Container): Container {
        return (Container.instance = instance);
    }

    public bound(key: Class | string): boolean {
        return this.bindings.has(key);
    }

    public bind<T>(key: Class | string, factory: Factory<T>): void {
        this.bindings.set(key, factory);
    }

    public singleton<T>(key: Class | string, factory: Factory<T>): void {
        this.bindings.set(key, factory);
        this.singletons.set(key, null);
    }

    public make<T>(key: Class | string): T {
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
     * @throws {Error} If key is a string and it hasn't been bound to the container.
     */
    private resolve(key: Class | string): any {
        if (this.bindings.has(key)) {
            return this.bindings.get(key)!(this);
        }

        if (typeof key === 'string') {
            throw new Error(`❗️${key} has not been bound to the container.`);
        }

        // Key is a class, so we'll resolve all its dependencies and return a new instance
        const paramTypes: any[] = Reflect.getMetadata('inject', key) ?? [];
        const dependencies = paramTypes.map((dep) => this.make(dep));

        return new key(...dependencies);
    }
}
