import 'reflect-metadata';

export type Factory<T = any> = (container: Container) => T;

export class Container {
    private bindings = new Map<string | Function, Factory>();
    private singletons = new Map<string | Function, any>();

    bind<T>(key: string | Function, factory: Factory<T>) {
        this.bindings.set(key, factory);
    }

    singleton<T>(key: string | Function, factory: Factory<T>) {
        this.bindings.set(key, factory);
        this.singletons.set(key, null);
    }

    make<T>(key: string | { new (...args: any[]): T }): T {
        // Return singleton if exists
        if (this.singletons.has(key)) {
            const instance = this.singletons.get(key);
            if (instance) return instance;
            const newInstance = this.resolve(key);
            this.singletons.set(key, newInstance);
            return newInstance;
        }
        return this.resolve(key);
    }

    private resolve<T>(key: string | { new (...args: any[]): T }): T {
        // Bound factory
        if (this.bindings.has(key)) {
            return this.bindings.get(key)!(this);
        }

        // Auto-resolve classes
        if (typeof key === 'function') {
            const paramTypes: any[] = Reflect.getMetadata('design:paramtypes', key) || [];
            const dependencies = paramTypes.map((dep) => this.make(dep));
            return new key(...dependencies);
        }

        throw new Error(`Nothing bound for key ${key}`);
    }
}
