import { Class, Factory } from './types.js';

export default class Container {
    private static instance: Container;

    private static bindings = new Map<Class | string, Factory>();

    private static singletons = new Map<Class | string, any>();

    public static getInstance(): Container {
        return Container.instance;
    }

    public static setInstance(instance: Container): Container {
        return (Container.instance = instance);
    }

    public static bound(key: Class | string): boolean {
        return Container.bindings.has(key);
    }

    public static bind<T>(key: Class | string, factory: Factory<T>): void {
        Container.bindings.set(key, factory);
    }

    public static singleton<T>(key: Class | string, factory: Factory<T>): void {
        Container.bindings.set(key, factory);
        Container.singletons.set(key, null);
    }

    public static make<T>(key: Class | string): T {
        if (Container.singletons.has(key)) {
            const instance = Container.singletons.get(key);

            if (instance) return instance;

            const newInstance = Container.resolve(key);
            Container.singletons.set(key, newInstance);

            return newInstance;
        }

        return this.resolve(key);
    }

    /**
     * @throws {Error} If key is a string and it hasn't been bound to the container.
     */
    private static resolve(key: Class | string): any {
        if (Container.bindings.has(key)) {
            return Container.bindings.get(key)!(Container);
        }

        if (typeof key === 'string') {
            throw new Error(`❗️${key} has not been bound to the container.`);
        }

        // Key is a class, so we'll resolve all its dependencies and return a new instance
        const paramTypes: any[] = Reflect.getMetadata('inject', key) ?? [];
        const dependencies = paramTypes.map((dep) => Container.make(dep));

        return new key(...dependencies);
    }
}
