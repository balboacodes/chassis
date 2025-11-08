import { Class, Factory } from './types.js';

export default class Container {
    private bindings = new Map<Class, Factory>();

    private singletons = new Map<Class, any>();

    public bound(key: Class): boolean {
        return this.bindings.has(key);
    }

    public bind<T>(key: Class, factory: Factory<T>): void {
        this.bindings.set(key, factory);
    }

    public singleton<T>(key: Class, factory: Factory<T>): void {
        this.bindings.set(key, factory);
        this.singletons.set(key, null);
    }

    public make<T>(key: Class<T>): T {
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
    private resolve<T>(key: Class<T>): T {
        if (this.bindings.has(key)) {
            return this.bindings.get(key)!(this);
        }

        // Key is a class, so we'll resolve all its dependencies and return a new instance
        const paramTypes: any[] = Reflect.getMetadata('inject', key) ?? [];
        const dependencies = paramTypes.map((dep) => this.make(dep));

        return new key(...dependencies);
    }
}
