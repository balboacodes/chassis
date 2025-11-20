import { isClass } from '@balboacodes/chassis';
import { array_merge, array_pop, count, unset } from '@balboacodes/php-utils';
import { Class } from '../types.ts';

export default class Container {
    /**
     * The current globally available container (if any).
     */
    protected static instance: Container;

    /**
     * An array of the types that have been resolved.
     */
    protected resolvedTypes: Map<string | Class, boolean> = new Map();

    /**
     * The container's bindings.
     */
    protected bindings: Map<
        string | Class,
        { concrete: ((container: Container, parameters?: unknown[]) => unknown) | Class; shared: boolean }
    > = new Map();

    /**
     * The container's method bindings.
     */
    protected methodBindings: Map<string, (instance: unknown, container: Container) => unknown> = new Map();

    /**
     * The container's shared instances.
     */
    protected instances: Map<string | Class, InstanceType<Class>> = new Map();

    /**
     * The registered type aliases.
     */
    protected aliases: Map<string | Class, string | Class> = new Map();

    /**
     * The registered aliases keyed by the abstract name.
     */
    protected abstractAliases: Map<string | Class, (string | Class)[]> = new Map();

    /**
     * The parameter override stack.
     */
    protected with: unknown[][] = [];

    /**
     * All of the registered rebound callbacks.
     */
    protected reboundCallbacks: Map<string | Class, ((container: Container, instance: Class) => unknown)[]> = new Map();

    /**
     * All of the global before resolving callbacks.
     */
    protected globalBeforeResolvingCallbacks: (() => unknown)[] = [];

    /**
     * All of the global resolving callbacks.
     */
    protected globalResolvingCallbacks: ((object: unknown, container: Container) => unknown)[] = [];

    /**
     * All of the global after resolving callbacks.
     */
    protected globalAfterResolvingCallbacks: (() => unknown)[] = [];

    /**
     * All of the before resolving callbacks by class type.
     */
    protected beforeResolvingCallbacks: Map<string | Class, (() => unknown)[]> = new Map();

    /**
     * All of the resolving callbacks by class type.
     */
    protected resolvingCallbacks: Map<string | Class, ((object: unknown, container: Container) => unknown)[]> =
        new Map();

    /**
     * All of the after resolving callbacks by class type.
     */
    protected afterResolvingCallbacks: Map<string | Class, (() => unknown)[]> = new Map();

    /**
     * The callback used to determine the container's environment.
     */
    protected environmentResolver?: (array: string[] | string) => boolean | string;

    /**
     * Determine if the given abstract type has been bound.
     */
    public bound(abstract: string | Class): boolean {
        return this.bindings.has(abstract) || this.instances.has(abstract) || this.isAlias(abstract);
    }

    /**
     * Determine if the given abstract type has been resolved.
     */
    public resolved(abstract: string | Class): boolean {
        if (this.isAlias(abstract)) {
            abstract = this.getAlias(abstract);
        }

        return this.resolvedTypes.has(abstract) || this.instances.has(abstract);
    }

    /**
     * Determine if a given type is shared.
     */
    public isShared(abstract: string | Class): boolean {
        if (this.instances.has(abstract)) {
            return true;
        }

        return this.bindings.get(abstract)?.['shared'] === true;
    }

    /**
     * Determine if a given string or class is an alias.
     */
    public isAlias(name: string | Class): boolean {
        return this.aliases.has(name);
    }

    /**
     * Register a binding with the container.
     *
     * @throws {TypeError} if concrete is not a function or string.
     */
    public bind(
        abstract: string | Class,
        concrete?: ((container: Container, parameters?: unknown[]) => unknown) | Class,
        shared: boolean = false,
    ): void {
        this.dropStaleInstances(abstract);

        // If no concrete type was given, we will simply set the concrete type to the
        // abstract type. After that, the concrete type to be registered as shared
        // without being forced to state their classes in both of the parameters.
        if (concrete === undefined) {
            concrete = abstract as Class;
        }

        // If the factory is not a Closure, it means it is just a class name which is
        // bound into this container to the abstract type and we will just wrap it
        // up inside its own Closure to give us more convenience when extending.
        if (typeof concrete === 'function' && concrete.toString().startsWith('class')) {
            concrete = this.getClosure(abstract, concrete as Class);
        }

        this.bindings.set(abstract, { concrete, shared });

        // If the abstract type was already resolved in this container we'll fire the
        // rebound listener so that any objects which have already gotten resolved
        // can have their copy of the object updated via the listener callbacks.
        if (this.resolved(abstract)) {
            this.rebound(abstract);
        }
    }

    /**
     * Get the Closure to be used when building a type.
     */
    protected getClosure(
        abstract: string | Class,
        concrete: Class,
    ): (container: Container, parameters?: unknown[]) => unknown {
        return (container: Container, parameters: unknown[] = []) => {
            if (abstract === concrete) {
                return container.build(concrete);
            }

            return container.resolve(concrete, parameters, false);
        };
    }

    /**
     * Determine if the container has a method binding.
     */
    public hasMethodBinding(method: string): boolean {
        return this.methodBindings.has(method);
    }

    /**
     * Bind a callback to resolve with Container.call.
     */
    public bindMethod(method: string, callback: (instance: unknown, container: Container) => unknown): void {
        this.methodBindings.set(method, callback);
    }

    /**
     * Get the method binding for the given method.
     */
    public callMethodBinding(method: string, instance: unknown): unknown {
        return this.methodBindings.get(method)?.(instance, this);
    }

    /**
     * Register a binding if it hasn't already been registered.
     */
    public bindIf(
        abstract: string | Class,
        concrete?: ((container: Container, parameters?: unknown[]) => unknown) | Class,
        shared: boolean = false,
    ): void {
        if (!this.bound(abstract)) {
            this.bind(abstract, concrete, shared);
        }
    }

    /**
     * Register a shared binding in the container.
     */
    public singleton(
        abstract: string | Class,
        concrete?: ((container: Container, parameters?: unknown[]) => unknown) | Class,
    ): void {
        this.bind(abstract, concrete, true);
    }

    /**
     * Register a shared binding if it hasn't already been registered.
     */
    public singletonIf(
        abstract: string | Class,
        concrete?: ((container: Container, parameters?: unknown[]) => unknown) | Class,
    ): void {
        if (!this.bound(abstract)) {
            this.singleton(abstract, concrete);
        }
    }

    /**
     * Register an existing instance as shared in the container.
     */
    public instance(abstract: string | Class, instance: InstanceType<Class> | unknown): InstanceType<Class> | unknown {
        this.removeAbstractAlias(abstract);

        const isBound = this.bound(abstract);

        this.aliases.delete(abstract);

        // We'll check to determine if this type has been bound before, and if it has
        // we will fire the rebound callbacks registered with the container and it
        // can be updated with consuming classes that have gotten resolved here.
        this.instances.set(abstract, instance);

        if (isBound) {
            this.rebound(abstract);
        }

        return instance;
    }

    /**
     * Remove an alias from the contextual binding alias cache.
     */
    protected removeAbstractAlias(searched: string | Class): void {
        if (!this.aliases.has(searched)) {
            return;
        }

        for (const [abstract, aliases] of this.abstractAliases.entries()) {
            for (const [index, alias] of Object.entries(aliases)) {
                if (alias === searched) {
                    unset(this.abstractAliases.get(abstract) ?? [], index);
                }
            }
        }
    }

    /**
     * Alias a type to a different name.
     *
     * @throws {Error}
     */
    public alias(abstract: string | Class, alias: string | Class): void {
        if (alias === abstract) {
            throw new Error('[{abstract}] is aliased to itself.');
        }

        this.removeAbstractAlias(alias);

        this.aliases.set(alias, abstract);

        if (!this.abstractAliases.has(abstract)) {
            this.abstractAliases.set(abstract, []);
        }

        this.abstractAliases.get(abstract)?.push(alias);
    }

    /**
     * Bind a new callback to an abstract's rebind event.
     */
    public rebinding(abstract: string | Class, callback: (container: Container, instance: Class) => unknown): unknown {
        abstract = this.getAlias(abstract);

        if (!this.reboundCallbacks.has(abstract)) {
            this.reboundCallbacks.set(abstract, []);
        }

        this.reboundCallbacks.get(abstract)?.push(callback);

        if (this.bound(abstract)) {
            return this.make(abstract);
        }
    }

    /**
     * Refresh an instance on the given target and method.
     */
    public refresh(abstract: string | Class, target: object, method: string): unknown {
        return this.rebinding(abstract, (_container, instance) => {
            // @ts-expect-error: need a better typing
            target[method](instance);
        });
    }

    /**
     * Fire the "rebound" callbacks for the given abstract type.
     */
    protected rebound(abstract: string | Class): void {
        const callbacks = this.getReboundCallbacks(abstract);

        if (!callbacks) {
            return;
        }

        const instance = this.make(abstract);

        for (const callback of callbacks) {
            callback(this, instance as Class);
        }
    }

    /**
     * Get the rebound callbacks for a given type.
     */
    protected getReboundCallbacks(abstract: string | Class): ((container: Container, instance: Class) => unknown)[] {
        return this.reboundCallbacks.get(abstract) ?? [];
    }

    /**
     * Resolve the given type from the container.
     */
    public make(abstract: string | Class, parameters: unknown[] = []): unknown {
        return this.resolve(abstract, parameters);
    }

    /**
     * Resolve the given type from the container.
     */
    protected resolve(abstract: string | Class, parameters: unknown[] = [], raiseEvents: boolean = true): unknown {
        abstract = this.getAlias(abstract);

        // First we'll fire any event handlers which handle the "before" resolving of
        // specific types. This gives some hooks the chance to add various extends
        // calls to change the resolution of objects that they're interested in.
        if (raiseEvents) {
            this.fireBeforeResolvingCallbacks(abstract, parameters);
        }

        const needsContextualBuild = parameters.length;

        // If an instance of the type is currently being managed as a singleton we'll
        // just return an existing instance instead of instantiating new instances
        // so the developer can keep using the same objects instance every time.
        if (this.instances.has(abstract) && !needsContextualBuild) {
            return this.instances.get(abstract);
        }

        this.with.push(parameters);

        const concrete = this.getConcrete(abstract);

        // We're ready to instantiate an instance of the concrete type registered for
        // the binding. This will instantiate the types, as well as resolve any of
        // its "nested" dependencies recursively until all have gotten resolved.
        const object = this.isBuildable(concrete, abstract)
            ? this.build(concrete as ((container: Container, parameters: unknown[]) => Class) | Class)
            : this.make(concrete as string | Class);

        // If the requested type is registered as a singleton we'll want to cache off
        // the instances in "memory" so we can return it later without creating an
        // entirely new instance of an object on each subsequent request for it.
        if (this.isShared(abstract) && !needsContextualBuild) {
            this.instances.set(abstract, object as Class);
        }

        if (raiseEvents) {
            this.fireResolvingCallbacks(abstract, object);
        }

        // Before returning, we will also set the resolved flag to "true" and pop off
        // the parameter overrides for this build. After those two things are done
        // we will be ready to return back the fully constructed class instance.
        if (!needsContextualBuild) {
            this.resolvedTypes.set(abstract, true);
        }

        array_pop(this.with);

        return object;
    }

    /**
     * Get the concrete type for a given abstract.
     */
    protected getConcrete(abstract: string | Class): unknown {
        // If we don't have a registered resolver or concrete for the type, we'll just
        // assume each type is a concrete name and will attempt to resolve it as is
        // since the container should be able to resolve concretes automatically.
        return this.bindings.get(abstract)?.['concrete'] ?? abstract;
    }

    /**
     * Determine if the given concrete is buildable.
     */
    protected isBuildable(concrete: unknown, abstract: string | Class): boolean {
        return concrete === abstract || typeof concrete === 'function';
    }

    /**
     * Instantiate a concrete instance of the given type.
     */
    public build(concrete: ((container: Container, parameters: unknown[]) => Class) | Class): Class {
        // If the concrete type is actually a Closure, we will just execute it and
        // hand back the results of the functions, which allows functions to be
        // used as resolvers for more fine-tuned resolution of these objects.
        if (!isClass(concrete)) {
            return (concrete as (container: Container, parameters: unknown[]) => Class)(
                this,
                this.getLastParameterOverride(),
            );
        }

        return new (concrete as Class)() as Class;
    }

    /**
     * Get the last parameter override.
     */
    protected getLastParameterOverride(): unknown[] {
        return count(this.with) ? this.with[this.with.length - 1] : [];
    }

    /**
     * Register a new before resolving callback for all types.
     */
    public beforeResolving(abstract: (() => unknown) | string | Class, callback?: () => unknown): void {
        if (!isClass(abstract) && typeof abstract !== 'string' && callback === undefined) {
            this.globalBeforeResolvingCallbacks.push(abstract);
        } else {
            abstract = this.getAlias(abstract);
            this.beforeResolvingCallbacks.get(abstract as string | Class)?.push(callback as () => unknown);
        }
    }

    /**
     * Register a new resolving callback.
     */
    public resolving(
        abstract: ((object: unknown, container: Container) => unknown) | string | Class,
        callback?: (object: unknown, container: Container) => unknown,
    ): void {
        if (!isClass(abstract) && typeof abstract !== 'string' && callback === undefined) {
            this.globalResolvingCallbacks.push(abstract);
        } else {
            abstract = this.getAlias(abstract);
            this.resolvingCallbacks.get(abstract as string | Class)?.push(
                callback as (object: unknown, container: Container) => unknown,
            );
        }
    }

    /**
     * Register a new after resolving callback for all types.
     */
    public afterResolving(abstract: (() => unknown) | string | Class, callback?: () => unknown): void {
        if (!isClass(abstract) && typeof abstract !== 'string' && callback === undefined) {
            this.globalAfterResolvingCallbacks.push(abstract);
        } else {
            abstract = this.getAlias(abstract);
            this.afterResolvingCallbacks.get(abstract as string | Class)?.push(callback as () => unknown);
        }
    }

    /**
     * Fire all of the before resolving callbacks.
     */
    protected fireBeforeResolvingCallbacks(abstract: string | Class, parameters: unknown[] = []): void {
        this.fireBeforeCallbackArray(abstract, parameters, this.globalBeforeResolvingCallbacks);

        for (const [type, callbacks] of Object.entries(this.beforeResolvingCallbacks)) {
            if (type === abstract) {
                this.fireBeforeCallbackArray(abstract, parameters, callbacks);
            }
        }
    }

    /**
     * Fire an array of callbacks with an object.
     */
    protected fireBeforeCallbackArray(
        abstract: string | Class,
        parameters: unknown[],
        callbacks: ((abstract: string | Class, parameters: unknown[], container: Container) => unknown)[],
    ): void {
        for (const callback of callbacks) {
            callback(abstract, parameters, this);
        }
    }

    /**
     * Fire all of the resolving callbacks.
     */
    protected fireResolvingCallbacks(abstract: string | Class, object: unknown): void {
        this.fireCallbackArray(object, this.globalResolvingCallbacks);

        this.fireCallbackArray(
            object,
            this.getCallbacksForType(abstract, object as object, this.resolvingCallbacks),
        );

        this.fireAfterResolvingCallbacks(abstract, object);
    }

    /**
     * Fire all of the after resolving callbacks.
     */
    protected fireAfterResolvingCallbacks(abstract: string | Class, object: unknown): void {
        this.fireCallbackArray(object, this.globalAfterResolvingCallbacks);

        this.fireCallbackArray(
            object,
            this.getCallbacksForType(abstract, object as object, this.afterResolvingCallbacks),
        );
    }

    /**
     * Get all callbacks for a given type.
     */
    protected getCallbacksForType(
        abstract: string | Class,
        object: object,
        callbacksPerType: Map<string | Class, ((object: unknown, container: Container) => unknown)[]>,
    ): ((object: unknown, container: Container) => unknown)[] {
        let results: ((object: unknown, container: Container) => unknown)[] = [];

        for (const [type, callbacks] of callbacksPerType) {
            if (type === abstract || (typeof type !== 'string' && object instanceof type)) {
                results = array_merge(results, callbacks) as ((object: unknown, container: Container) => unknown)[];
            }
        }

        return results;
    }

    /**
     * Fire an array of callbacks with an object.
     */
    protected fireCallbackArray(
        object: unknown,
        callbacks: ((object: unknown, container: Container) => unknown)[],
    ): void {
        for (const callback of callbacks) {
            callback(object, this);
        }
    }

    /**
     * Get the container's bindings.
     */
    public getBindings(): Map<string | Class, {
        concrete: ((container: Container, parameters?: unknown[]) => unknown) | Class;
        shared: boolean;
    }> {
        return this.bindings;
    }

    /**
     * Get the alias for an abstract if available.
     */
    public getAlias(abstract: string | Class): string | Class {
        return this.aliases.get(abstract) ?? abstract;
    }

    /**
     * Drop all of the stale instances and aliases.
     */
    protected dropStaleInstances(abstract: string | Class): void {
        this.instances.delete(abstract);
        this.aliases.delete(abstract);
    }

    /**
     * Remove a resolved instance from the instance cache.
     */
    public forgetInstance(abstract: string | Class): void {
        this.instances.delete(abstract);
    }

    /**
     * Clear all of the instances from the container.
     */
    public forgetInstances(): void {
        this.instances.clear();
    }

    /**
     * Set the callback which determines the current container environment.
     */
    public resolveEnvironmentUsing(callback?: (array: string[] | string) => boolean | string) {
        this.environmentResolver = callback;
    }

    /**
     * Determine the environment for the container.
     */
    public currentEnvironmentIs(environments: string[] | string): boolean | string {
        return this.environmentResolver === undefined ? false : this.environmentResolver(environments);
    }

    /**
     * Flush the container of all bindings and resolved instances.
     */
    public flush(): void {
        this.aliases.clear();
        this.resolvedTypes.clear();
        this.bindings.clear();
        this.instances.clear();
        this.abstractAliases.clear();
    }

    /**
     * Get the globally available instance of the container.
     */
    public static getInstance(): Container {
        return Container.instance ??= new Container();
    }

    /**
     * Set the shared instance of the container.
     */
    public static setInstance(container: Container): Container {
        return Container.instance = container;
    }
}
