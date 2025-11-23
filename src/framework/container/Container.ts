import { isClass } from '../support/helpers.ts';
import { Abstract, Class } from '../types.ts';

export class Container {
    /**
     * The current globally available container (if any).
     */
    protected static instance: Container;

    /**
     * An array of the types that have been resolved.
     */
    protected resolvedTypes: Map<Abstract, boolean> = new Map();

    /**
     * The container's bindings.
     */
    protected bindings: Map<Abstract, {
        concrete: (container: Container, parameters?: unknown[]) => unknown;
        shared: boolean;
    }> = new Map();

    /**
     * The container's shared instances.
     */
    protected instances: Map<Abstract, unknown> = new Map();

    /**
     * All of the registered rebound callbacks.
     */
    protected reboundCallbacks: Map<Abstract, ((container: Container, instance: object) => unknown)[]> = new Map();

    /**
     * All of the global before resolving callbacks.
     */
    protected globalBeforeResolvingCallbacks:
        ((abstract: Abstract, parameters: unknown[], container: Container) => unknown)[] = [];

    /**
     * All of the global resolving callbacks.
     */
    protected globalResolvingCallbacks: ((object: object, container: Container) => unknown)[] = [];

    /**
     * All of the global after resolving callbacks.
     */
    protected globalAfterResolvingCallbacks: ((object: object, container: Container) => unknown)[] = [];

    /**
     * All of the before resolving callbacks by class type.
     */
    protected beforeResolvingCallbacks: Map<
        Abstract,
        ((abstract: Abstract, parameters: unknown[], container: Container) => unknown)[]
    > = new Map();

    /**
     * All of the resolving callbacks by class type.
     */
    protected resolvingCallbacks: Map<Abstract, ((object: object, container: Container) => unknown)[]> = new Map();

    /**
     * All of the after resolving callbacks by class type.
     */
    protected afterResolvingCallbacks: Map<Abstract, ((object: object, container: Container) => unknown)[]> = new Map();

    /**
     * The callback used to determine the container's environment.
     */
    protected environmentResolver?: (environments: string[] | string) => boolean | string;

    /**
     * Determine if the given abstract type has been bound.
     */
    public bound(abstract: Abstract): boolean {
        return this.bindings.has(abstract) || this.instances.has(abstract);
    }

    /**
     * Determine if the given abstract type has been resolved.
     */
    public resolved(abstract: Abstract): boolean {
        return this.resolvedTypes.has(abstract) || this.instances.has(abstract);
    }

    /**
     * Determine if a given type is shared.
     */
    public isShared(abstract: Abstract): boolean {
        if (this.instances.has(abstract)) {
            return true;
        }

        if (this.bindings.get(abstract)?.shared === true) {
            return true;
        }

        return false;
    }

    /**
     * Register a binding with the container.
     */
    public bind(
        abstract: Abstract,
        concrete?: ((container: Container, parameters?: unknown[]) => unknown) | Abstract,
        shared: boolean = false,
    ): void {
        this.dropStaleInstances(abstract);

        // If no concrete type was given, we will simply set the concrete type to the
        // abstract type. After that, the concrete type to be registered as shared
        // without being forced to state their classes in both of the parameters.
        if (concrete === undefined) {
            concrete = abstract;
        }

        // If the factory is not a Closure, it means it is a class which is
        // bound into this container to the abstract type and we will just wrap it
        // up inside its own Closure to give us more convenience when extending.
        if (typeof concrete !== 'function' || isClass(concrete)) {
            concrete = this.getClosure(abstract, concrete);
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
        abstract: Abstract,
        concrete: Abstract,
    ): (container: Container, parameters?: unknown[]) => unknown {
        return (container, parameters = []) => {
            if (abstract === concrete) {
                // @ts-ignore:
                return container.build(concrete);
            }

            return container.resolve(abstract, parameters, false);
        };
    }

    /**
     * Register a binding if it hasn't already been registered.
     */
    public bindIf(
        abstract: Abstract,
        concrete?: ((container: Container, parameters?: unknown[]) => unknown) | Abstract,
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
        abstract: Abstract,
        concrete?: ((container: Container, parameters?: unknown[]) => unknown) | Abstract,
    ): void {
        this.bind(abstract, concrete, true);
    }

    /**
     * Register a shared binding if it hasn't already been registered.
     */
    public singletonIf(
        abstract: Abstract,
        concrete?: ((container: Container, parameters?: unknown[]) => unknown) | Abstract,
    ): void {
        if (!this.bound(abstract)) {
            this.singleton(abstract, concrete);
        }
    }

    /**
     * Register an existing instance as shared in the container.
     */
    public instance<TInstance>(abstract: Abstract, instance: TInstance): TInstance {
        const isBound = this.bound(abstract);

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
     * Bind a new callback to an abstract's rebind event.
     */
    public rebinding(abstract: Abstract, callback: () => unknown): unknown {
        this.reboundCallbacks.get(abstract)?.push(callback);

        if (this.bound(abstract)) {
            return this.make(abstract);
        }
    }

    /**
     * Refresh an instance on the given target and method.
     */
    public refresh(abstract: Abstract, target: object, method: string): unknown {
        // @ts-ignore:
        return this.rebinding(abstract, (_app, instance) => {
            // @ts-ignore:
            target[method](instance);
        });
    }

    /**
     * Fire the "rebound" callbacks for the given abstract type.
     */
    protected rebound(abstract: Abstract): void {
        const callbacks = this.getReboundCallbacks(abstract);

        if (callbacks.length === 0) {
            return;
        }

        const instance = this.make(abstract) as object;

        for (const callback of callbacks) {
            callback(this, instance);
        }
    }

    /**
     * Get the rebound callbacks for a given type.
     */
    protected getReboundCallbacks(abstract: Abstract): ((container: Container, instance: object) => unknown)[] {
        return this.reboundCallbacks.get(abstract) ?? [];
    }

    /**
     * Resolve the given type from the container.
     */
    public make(abstract: Abstract, parameters: unknown[] = []): unknown {
        return this.resolve(abstract, parameters);
    }

    /**
     * Resolve the given type from the container.
     */
    protected resolve(abstract: Abstract, parameters: unknown[] = [], raiseEvents: boolean = true): unknown {
        // First we'll fire any event handlers which handle the "before" resolving of
        // specific types. This gives some hooks the chance to add various extends
        // calls to change the resolution of objects that they're interested in.
        if (raiseEvents) {
            this.fireBeforeResolvingCallbacks(abstract, parameters);
        }

        // If an instance of the type is currently being managed as a singleton we'll
        // just return an existing instance instead of instantiating new instances
        // so the developer can keep using the same objects instance every time.
        if (this.instances.has(abstract)) {
            return this.instances.get(abstract);
        }

        const concrete = this.getConcrete(abstract);

        // We're ready to instantiate an instance of the concrete type registered for
        // the binding. This will instantiate the types, as well as resolve any of
        // its "nested" dependencies recursively until all have gotten resolved.
        const object = this.isBuildable(concrete, abstract)
            ? this.build(concrete as (container: Container, parameters?: unknown[]) => unknown)
            : this.make(concrete as Abstract);

        // If the requested type is registered as a singleton we'll want to cache off
        // the instances in "memory" so we can return it later without creating an
        // entirely new instance of an object on each subsequent request for it.
        if (this.isShared(abstract)) {
            this.instances.set(abstract, object);
        }

        if (raiseEvents) {
            this.fireResolvingCallbacks(abstract, object as object);
        }

        // Before returning, we will also set the resolved flag to "true" and pop off
        // the parameter overrides for this build. After those two things are done
        // we will be ready to return back the fully constructed class instance.
        this.resolvedTypes.set(abstract, true);

        return object;
    }

    /**
     * Get the concrete type for a given abstract.
     */
    protected getConcrete(abstract: Abstract): unknown {
        // If we don't have a registered resolver or concrete for the type, we'll just
        // assume each type is a concrete name and will attempt to resolve it as is
        // since the container should be able to resolve concretes automatically.
        if (this.bindings.has(abstract)) {
            return this.bindings.get(abstract)?.['concrete'];
        }

        return abstract;
    }

    /**
     * Determine if the given concrete is buildable.
     */
    protected isBuildable(concrete: unknown, abstract: Abstract): boolean {
        return concrete === abstract || typeof concrete === 'function';
    }

    /**
     * Instantiate a concrete instance of the given type.
     */
    public build<TClass extends Class>(
        concrete: ((container: Container) => InstanceType<TClass>) | TClass,
    ): InstanceType<TClass> {
        // If the concrete type is actually a Closure, we will just execute it and
        // hand back the results of the functions, which allows functions to be
        // used as resolvers for more fine-tuned resolution of these objects.
        if (!isClass(concrete)) {
            return concrete(this);
        }

        return new concrete() as InstanceType<TClass>;
    }

    /**
     * Register a new before resolving callback for all types.
     */
    public beforeResolving(abstract: (() => unknown) | Abstract, callback?: () => unknown): void {
        if (typeof abstract === 'function' && !isClass(abstract) && !callback) {
            this.globalBeforeResolvingCallbacks.push(abstract);
        } else {
            this.beforeResolvingCallbacks.get(abstract as Abstract)?.push(callback!);
        }
    }

    /**
     * Register a new resolving callback.
     */
    public resolving(abstract: (() => unknown) | Abstract, callback?: () => unknown): void {
        if (typeof abstract === 'function' && !isClass(abstract) && !callback) {
            this.globalResolvingCallbacks.push(abstract);
        } else {
            this.resolvingCallbacks.get(abstract as Abstract)?.push(callback!);
        }
    }

    /**
     * Register a new after resolving callback for all types.
     */
    public afterResolving(
        abstract: (() => unknown) | Abstract,
        callback?: (object: object, container: Container) => unknown,
    ): void {
        if (typeof abstract === 'function' && !isClass(abstract) && !callback) {
            this.globalAfterResolvingCallbacks.push(abstract);
        } else {
            this.afterResolvingCallbacks.get(abstract as Abstract)?.push(callback!);
        }
    }

    /**
     * Fire all of the before resolving callbacks.
     */
    protected fireBeforeResolvingCallbacks(abstract: Abstract, parameters: unknown[] = []): void {
        this.fireBeforeCallbackArray(abstract, parameters, this.globalBeforeResolvingCallbacks);

        for (const [type, callbacks] of this.beforeResolvingCallbacks) {
            if (type === abstract) {
                this.fireBeforeCallbackArray(abstract, parameters, callbacks);
            }
        }
    }

    /**
     * Fire an array of callbacks with an object.
     */
    protected fireBeforeCallbackArray(
        abstract: Abstract,
        parameters: unknown[],
        callbacks: ((abstract: Abstract, parameters: unknown[], container: Container) => unknown)[],
    ): void {
        for (const callback of callbacks) {
            callback(abstract, parameters, this);
        }
    }

    /**
     * Fire all of the resolving callbacks.
     */
    protected fireResolvingCallbacks(abstract: Abstract, object: object): void {
        this.fireCallbackArray(object, this.globalResolvingCallbacks);

        this.fireCallbackArray(object, this.getCallbacksForType(abstract, object, this.resolvingCallbacks));

        this.fireAfterResolvingCallbacks(abstract, object);
    }

    /**
     * Fire all of the after resolving callbacks.
     */
    protected fireAfterResolvingCallbacks(abstract: Abstract, object: object): void {
        this.fireCallbackArray(object, this.globalAfterResolvingCallbacks);

        this.fireCallbackArray(object, this.getCallbacksForType(abstract, object, this.afterResolvingCallbacks));
    }

    /**
     * Get all callbacks for a given type.
     */
    protected getCallbacksForType(
        abstract: Abstract,
        object: unknown,
        callbacksPerType: Map<Abstract, ((object: object, container: Container) => unknown)[]>,
    ): ((object: object, container: Container) => unknown)[] {
        const results = [];

        for (const [type, callbacks] of callbacksPerType) {
            if (type === abstract || (isClass(type) && object instanceof type)) {
                results.push(...callbacks);
            }
        }

        return results;
    }

    /**
     * Fire an array of callbacks with an object.
     */
    protected fireCallbackArray(
        object: object,
        callbacks: ((object: object, container: Container) => unknown)[],
    ): void {
        for (const callback of callbacks) {
            callback(object, this);
        }
    }

    /**
     * Get the container's bindings.
     */
    public getBindings(): typeof this.bindings {
        return this.bindings;
    }

    /**
     * Drop all of the stale instances.
     */
    protected dropStaleInstances(abstract: Abstract): void {
        this.instances.delete(abstract);
    }

    /**
     * Remove a resolved instance from the instance cache.
     */
    public forgetInstance(abstract: Abstract): void {
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
    public resolveEnvironmentUsing(callback?: (environments: string[] | string) => boolean | string): void {
        this.environmentResolver = callback;
    }

    /**
     * Determine the environment for the container.
     */
    public currentEnvironmentIs(environments: string[] | string): boolean {
        return this.environmentResolver === undefined ? false : !!this.environmentResolver(environments);
    }

    /**
     * Flush the container of all bindings and resolved instances.
     */
    public flush(): void {
        this.resolvedTypes.clear();
        this.bindings.clear();
        this.instances.clear();
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
