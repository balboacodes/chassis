import { isClass } from './support/helpers.ts';
import { Class, Factory } from './types.ts';

export default class Container {
    private static instance: Container;

    private singletons = new Map<Class | string, any>();

    private bindings = new Map<Class | string, Factory>();

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

    public make<T extends Class | string>(key: T): T extends Class ? InstanceType<T> : any {
        if (this.singletons.has(key)) {
            const instance = this.singletons.get(key);

            if (instance) return instance;

            const newInstance = this.resolve(key);
            this.singletons.set(key, newInstance);

            return newInstance;
        }

        return this.resolve(key);
    }

    public static inject(
        target: Class,
        whenParams: (paramTypes: any[]) => any,
        noParams: () => any,
        method?: string,
    ): any {
        // prettier-ignore
        const paramTypes: any[] = (
            method
                ? Reflect.getMetadata('design:paramtypes', target, method)
                : Reflect.getMetadata('design:paramtypes', target)
        ) ?? [];

        if (paramTypes.length === 0) {
            return noParams();
        }

        return whenParams(paramTypes);
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
        return Container.inject(
            key,
            (paramTypes: any[]) => {
                const dependencies = paramTypes.map((dep) => (isClass(dep) ? this.make(dep) : undefined));
                return new key(...dependencies);
            },
            () => new key(),
        );
    }
}
