import { array_merge, array_pop, count } from '@balboacodes/php-utils';
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
    protected methodBindings: (() => unknown)[] = [];

    /**
     * The container's shared instances.
     */
    protected instances: Map<string | Class, Class> = new Map();

    /**
     * The registered type aliases.
     */
    protected aliases: Map<string | Class, string | Class> = new Map();

    /**
     * The registered aliases keyed by the abstract name.
     */
    protected abstractAliases: Map<string | Class, (string | Class)[]> = new Map();

    /**
     * All of the registered tags.
     */
    protected tags: unknown[] = [];

    /**
     * The parameter override stack.
     */
    protected with: unknown[][] = [];

    /**
     * Whether a class has already been checked for Singleton attributes.
     */
    protected checkedForSingletonOrScopedAttributes: Map<string | Class, 'singleton' | null> = new Map();

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
    public bound(abstract: string): boolean {
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
     * Determine if a given string is an alias.
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

    //     /**
    //      * Determine if the container has a method binding.
    //      *
    //      * @param  string  $method
    //      * @return bool
    //      */
    //     public function hasMethodBinding($method)
    //     {
    //         return isset($this->methodBindings[$method]);
    //     }

    //     /**
    //      * Bind a callback to resolve with Container::call.
    //      *
    //      * @param  array|string  $method
    //      * @param  \Closure  $callback
    //      * @return void
    //      */
    //     public function bindMethod($method, $callback)
    //     {
    //         $this->methodBindings[$this->parseBindMethod($method)] = $callback;
    //     }

    //     /**
    //      * Get the method to be bound in class@method format.
    //      *
    //      * @param  array|string  $method
    //      * @return string
    //      */
    //     protected function parseBindMethod($method)
    //     {
    //         if (is_array($method)) {
    //             return $method[0].'@'.$method[1];
    //         }

    //         return $method;
    //     }

    //     /**
    //      * Get the method binding for the given method.
    //      *
    //      * @param  string  $method
    //      * @param  mixed  $instance
    //      * @return mixed
    //      */
    //     public function callMethodBinding($method, $instance)
    //     {
    //         return call_user_func($this->methodBindings[$method], $instance, $this);
    //     }

    //     /**
    //      * Add a contextual binding to the container.
    //      *
    //      * @param  string  $concrete
    //      * @param  \Closure|string  $abstract
    //      * @param  \Closure|string  $implementation
    //      * @return void
    //      */
    //     public function addContextualBinding($concrete, $abstract, $implementation)
    //     {
    //         $this->contextual[$concrete][$this->getAlias($abstract)] = $implementation;
    //     }

    //     /**
    //      * Register a binding if it hasn't already been registered.
    //      *
    //      * @param  \Closure|string  $abstract
    //      * @param  \Closure|string|null  $concrete
    //      * @param  bool  $shared
    //      * @return void
    //      */
    //     public function bindIf($abstract, $concrete = null, $shared = false)
    //     {
    //         if (! $this->bound($abstract)) {
    //             $this->bind($abstract, $concrete, $shared);
    //         }
    //     }

    //     /**
    //      * Register a shared binding in the container.
    //      *
    //      * @param  \Closure|string  $abstract
    //      * @param  \Closure|string|null  $concrete
    //      * @return void
    //      */
    //     public function singleton($abstract, $concrete = null)
    //     {
    //         $this->bind($abstract, $concrete, true);
    //     }

    //     /**
    //      * Register a shared binding if it hasn't already been registered.
    //      *
    //      * @param  \Closure|string  $abstract
    //      * @param  \Closure|string|null  $concrete
    //      * @return void
    //      */
    //     public function singletonIf($abstract, $concrete = null)
    //     {
    //         if (! $this->bound($abstract)) {
    //             $this->singleton($abstract, $concrete);
    //         }
    //     }

    //     /**
    //      * Register a scoped binding in the container.
    //      *
    //      * @param  \Closure|string  $abstract
    //      * @param  \Closure|string|null  $concrete
    //      * @return void
    //      */
    //     public function scoped($abstract, $concrete = null)
    //     {
    //         $this->scopedInstances[] = $abstract;

    //         $this->singleton($abstract, $concrete);
    //     }

    //     /**
    //      * Register a scoped binding if it hasn't already been registered.
    //      *
    //      * @param  \Closure|string  $abstract
    //      * @param  \Closure|string|null  $concrete
    //      * @return void
    //      */
    //     public function scopedIf($abstract, $concrete = null)
    //     {
    //         if (! $this->bound($abstract)) {
    //             $this->scoped($abstract, $concrete);
    //         }
    //     }

    //     /**
    //      * "Extend" an abstract type in the container.
    //      *
    //      * @param  string  $abstract
    //      * @param  \Closure  $closure
    //      * @return void
    //      *
    //      * @throws \InvalidArgumentException
    //      */
    //     public function extend($abstract, Closure $closure)
    //     {
    //         $abstract = $this->getAlias($abstract);

    //         if (isset($this->instances[$abstract])) {
    //             $this->instances[$abstract] = $closure($this->instances[$abstract], $this);

    //             $this->rebound($abstract);
    //         } else {
    //             $this->extenders[$abstract][] = $closure;

    //             if ($this->resolved($abstract)) {
    //                 $this->rebound($abstract);
    //             }
    //         }
    //     }

    //     /**
    //      * Register an existing instance as shared in the container.
    //      *
    //      * @template TInstance of mixed
    //      *
    //      * @param  string  $abstract
    //      * @param  TInstance  $instance
    //      * @return TInstance
    //      */
    //     public function instance($abstract, $instance)
    //     {
    //         $this->removeAbstractAlias($abstract);

    //         $isBound = $this->bound($abstract);

    //         unset($this->aliases[$abstract]);

    //         // We'll check to determine if this type has been bound before, and if it has
    //         // we will fire the rebound callbacks registered with the container and it
    //         // can be updated with consuming classes that have gotten resolved here.
    //         $this->instances[$abstract] = $instance;

    //         if ($isBound) {
    //             $this->rebound($abstract);
    //         }

    //         return $instance;
    //     }

    //     /**
    //      * Remove an alias from the contextual binding alias cache.
    //      *
    //      * @param  string  $searched
    //      * @return void
    //      */
    //     protected function removeAbstractAlias($searched)
    //     {
    //         if (! isset($this->aliases[$searched])) {
    //             return;
    //         }

    //         foreach ($this->abstractAliases as $abstract => $aliases) {
    //             foreach ($aliases as $index => $alias) {
    //                 if ($alias == $searched) {
    //                     unset($this->abstractAliases[$abstract][$index]);
    //                 }
    //             }
    //         }
    //     }

    //     /**
    //      * Assign a set of tags to a given binding.
    //      *
    //      * @param  array|string  $abstracts
    //      * @param  mixed  ...$tags
    //      * @return void
    //      */
    //     public function tag($abstracts, $tags)
    //     {
    //         $tags = is_array($tags) ? $tags : array_slice(func_get_args(), 1);

    //         foreach ($tags as $tag) {
    //             if (! isset($this->tags[$tag])) {
    //                 $this->tags[$tag] = [];
    //             }

    //             foreach ((array) $abstracts as $abstract) {
    //                 $this->tags[$tag][] = $abstract;
    //             }
    //         }
    //     }

    //     /**
    //      * Resolve all of the bindings for a given tag.
    //      *
    //      * @param  string  $tag
    //      * @return iterable
    //      */
    //     public function tagged($tag)
    //     {
    //         if (! isset($this->tags[$tag])) {
    //             return [];
    //         }

    //         return new RewindableGenerator(function () use ($tag) {
    //             foreach ($this->tags[$tag] as $abstract) {
    //                 yield $this->make($abstract);
    //             }
    //         }, count($this->tags[$tag]));
    //     }

    //     /**
    //      * Alias a type to a different name.
    //      *
    //      * @param  string  $abstract
    //      * @param  string  $alias
    //      * @return void
    //      *
    //      * @throws \LogicException
    //      */
    //     public function alias($abstract, $alias)
    //     {
    //         if ($alias === $abstract) {
    //             throw new LogicException("[{$abstract}] is aliased to itself.");
    //         }

    //         $this->removeAbstractAlias($alias);

    //         $this->aliases[$alias] = $abstract;

    //         $this->abstractAliases[$abstract][] = $alias;
    //     }

    //     /**
    //      * Bind a new callback to an abstract's rebind event.
    //      *
    //      * @param  string  $abstract
    //      * @param  \Closure  $callback
    //      * @return mixed
    //      */
    //     public function rebinding($abstract, Closure $callback)
    //     {
    //         $this->reboundCallbacks[$abstract = $this->getAlias($abstract)][] = $callback;

    //         if ($this->bound($abstract)) {
    //             return $this->make($abstract);
    //         }
    //     }

    //     /**
    //      * Refresh an instance on the given target and method.
    //      *
    //      * @param  string  $abstract
    //      * @param  mixed  $target
    //      * @param  string  $method
    //      * @return mixed
    //      */
    //     public function refresh($abstract, $target, $method)
    //     {
    //         return $this->rebinding($abstract, function ($app, $instance) use ($target, $method) {
    //             $target->{$method}($instance);
    //         });
    //     }

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

    //     /**
    //      * Wrap the given closure such that its dependencies will be injected when executed.
    //      *
    //      * @param  \Closure  $callback
    //      * @param  array  $parameters
    //      * @return \Closure
    //      */
    //     public function wrap(Closure $callback, array $parameters = [])
    //     {
    //         return fn () => $this->call($callback, $parameters);
    //     }

    //     /**
    //      * Call the given Closure / class@method and inject its dependencies.
    //      *
    //      * @param  callable|string  $callback
    //      * @param  array<string, mixed>  $parameters
    //      * @param  string|null  $defaultMethod
    //      * @return mixed
    //      *
    //      * @throws \InvalidArgumentException
    //      */
    //     public function call($callback, array $parameters = [], $defaultMethod = null)
    //     {
    //         $pushedToBuildStack = false;

    //         if (($className = $this->getClassForCallable($callback)) && ! in_array(
    //             $className,
    //             $this->buildStack,
    //             true
    //         )) {
    //             $this->buildStack[] = $className;

    //             $pushedToBuildStack = true;
    //         }

    //         $result = BoundMethod::call($this, $callback, $parameters, $defaultMethod);

    //         if ($pushedToBuildStack) {
    //             array_pop($this->buildStack);
    //         }

    //         return $result;
    //     }

    //     /**
    //      * Get the class name for the given callback, if one can be determined.
    //      *
    //      * @param  callable|string  $callback
    //      * @return string|false
    //      */
    //     protected function getClassForCallable($callback)
    //     {
    //         if (is_callable($callback) &&
    //             ! ($reflector = new ReflectionFunction($callback(...)))->isAnonymous()) {
    //             return $reflector->getClosureScopeClass()->name ?? false;
    //         }

    //         return false;
    //     }

    //     /**
    //      * Get a closure to resolve the given type from the container.
    //      *
    //      * @template TClass of object
    //      *
    //      * @param  string|class-string<TClass>  $abstract
    //      * @return ($abstract is class-string<TClass> ? \Closure(): TClass : \Closure(): mixed)
    //      */
    //     public function factory($abstract)
    //     {
    //         return fn () => $this->make($abstract);
    //     }

    //     /**
    //      * An alias function name for make().
    //      *
    //      * @template TClass of object
    //      *
    //      * @param  string|class-string<TClass>|callable  $abstract
    //      * @param  array  $parameters
    //      * @return ($abstract is class-string<TClass> ? TClass : mixed)
    //      *
    //      * @throws \Illuminate\Contracts\Container\BindingResolutionException
    //      */
    //     public function makeWith($abstract, array $parameters = [])
    //     {
    //         return $this->make($abstract, $parameters);
    //     }

    /**
     * Resolve the given type from the container.
     */
    public make(abstract: string | Class, parameters: unknown[] = []): unknown {
        return this.resolve(abstract, parameters);
    }

    //     /**
    //      * {@inheritdoc}
    //      *
    //      * @template TClass of object
    //      *
    //      * @param  string|class-string<TClass>  $id
    //      * @return ($id is class-string<TClass> ? TClass : mixed)
    //      */
    //     public function get(string $id)
    //     {
    //         try {
    //             return $this->resolve($id);
    //         } catch (Exception $e) {
    //             if ($this->has($id) || $e instanceof CircularDependencyException) {
    //                 throw $e;
    //             }

    //             throw new EntryNotFoundException($id, is_int($e->getCode()) ? $e->getCode() : 0, $e);
    //         }
    //     }

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

        let concrete = null;

        const needsContextualBuild = parameters.length;

        // If an instance of the type is currently being managed as a singleton we'll
        // just return an existing instance instead of instantiating new instances
        // so the developer can keep using the same objects instance every time.
        if (this.instances.has(abstract) && !needsContextualBuild) {
            return this.instances.get(abstract);
        }

        this.with.push(parameters);

        concrete = this.getConcrete(abstract);

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

    //     /**
    //      * Find the concrete binding for the given abstract in the contextual binding array.
    //      *
    //      * @param  string|callable  $abstract
    //      * @return \Closure|string|null
    //      */
    //     protected function findInContextualBindings($abstract)
    //     {
    //         return $this->contextual[end($this->buildStack)][$abstract] ?? null;
    //     }

    /**
     * Determine if the given concrete is buildable.
     */
    protected isBuildable(concrete: unknown, abstract: string | Class): boolean {
        return concrete === abstract || typeof concrete === 'function';
    }

    /**
     * Instantiate a concrete instance of the given type.
     */
    public build(
        concrete: ((container: Container, parameters: unknown[]) => Class) | Class,
    ): Class {
        // If the concrete type is actually a Closure, we will just execute it and
        // hand back the results of the functions, which allows functions to be
        // used as resolvers for more fine-tuned resolution of these objects.
        if (!concrete.toString().startsWith('class')) {
            return (concrete as (container: Container, parameters: unknown[]) => Class)(
                this,
                this.getLastParameterOverride(),
            );
        }

        return new (concrete as Class)() as Class;
    }

    //     /**
    //      * Instantiate a concrete instance of the given self building type.
    //      *
    //      * @param  \Closure(static, array): TClass|class-string<TClass>  $concrete
    //      * @param  \ReflectionClass  $reflector
    //      * @return TClass
    //      *
    //      * @throws \Illuminate\Contracts\Container\BindingResolutionException
    //      */
    //     protected function buildSelfBuildingInstance($concrete, $reflector)
    //     {
    //         if (! method_exists($concrete, 'newInstance')) {
    //             throw new BindingResolutionException("No newInstance method exists for [$concrete].");
    //         }

    //         $this->buildStack[] = $concrete;

    //         $instance = $this->call([$concrete, 'newInstance']);

    //         array_pop($this->buildStack);

    //         $this->fireAfterResolvingAttributeCallbacks(
    //             $reflector->getAttributes(), $instance
    //         );

    //         return $instance;
    //     }

    //     /**
    //      * Resolve all of the dependencies from the ReflectionParameters.
    //      *
    //      * @param  \ReflectionParameter[]  $dependencies
    //      * @return array
    //      *
    //      * @throws \Illuminate\Contracts\Container\BindingResolutionException
    //      */
    //     protected function resolveDependencies(array $dependencies)
    //     {
    //         $results = [];

    //         foreach ($dependencies as $dependency) {
    //             // If the dependency has an override for this particular build we will use
    //             // that instead as the value. Otherwise, we will continue with this run
    //             // of resolutions and let reflection attempt to determine the result.
    //             if ($this->hasParameterOverride($dependency)) {
    //                 $results[] = $this->getParameterOverride($dependency);

    //                 continue;
    //             }

    //             $result = null;

    //             if (! is_null($attribute = Util::getContextualAttributeFromDependency($dependency))) {
    //                 $result = $this->resolveFromAttribute($attribute);
    //             }

    //             // If the class is null, it means the dependency is a string or some other
    //             // primitive type which we can not resolve since it is not a class and
    //             // we will just bomb out with an error since we have no-where to go.
    //             $result ??= is_null(Util::getParameterClassName($dependency))
    //                 ? $this->resolvePrimitive($dependency)
    //                 : $this->resolveClass($dependency);

    //             $this->fireAfterResolvingAttributeCallbacks($dependency->getAttributes(), $result);

    //             if ($dependency->isVariadic()) {
    //                 $results = array_merge($results, $result);
    //             } else {
    //                 $results[] = $result;
    //             }
    //         }

    //         return $results;
    //     }

    //     /**
    //      * Determine if the given dependency has a parameter override.
    //      *
    //      * @param  \ReflectionParameter  $dependency
    //      * @return bool
    //      */
    //     protected function hasParameterOverride($dependency)
    //     {
    //         return array_key_exists(
    //             $dependency->name, $this->getLastParameterOverride()
    //         );
    //     }

    //     /**
    //      * Get a parameter override for a dependency.
    //      *
    //      * @param  \ReflectionParameter  $dependency
    //      * @return mixed
    //      */
    //     protected function getParameterOverride($dependency)
    //     {
    //         return $this->getLastParameterOverride()[$dependency->name];
    //     }

    /**
     * Get the last parameter override.
     */
    protected getLastParameterOverride(): unknown[] {
        return count(this.with) ? this.with[this.with.length - 1] : [];
    }

    //     /**
    //      * Resolve a non-class hinted primitive dependency.
    //      *
    //      * @param  \ReflectionParameter  $parameter
    //      * @return mixed
    //      *
    //      * @throws \Illuminate\Contracts\Container\BindingResolutionException
    //      */
    //     protected function resolvePrimitive(ReflectionParameter $parameter)
    //     {
    //         if (! is_null($concrete = $this->getContextualConcrete('$'.$parameter->getName()))) {
    //             return Util::unwrapIfClosure($concrete, $this);
    //         }

    //         if ($parameter->isDefaultValueAvailable()) {
    //             return $parameter->getDefaultValue();
    //         }

    //         if ($parameter->isVariadic()) {
    //             return [];
    //         }

    //         if ($parameter->hasType() && $parameter->allowsNull()) {
    //             return null;
    //         }

    //         $this->unresolvablePrimitive($parameter);
    //     }

    //     /**
    //      * Resolve a class based dependency from the container.
    //      *
    //      * @param  \ReflectionParameter  $parameter
    //      * @return mixed
    //      *
    //      * @throws \Illuminate\Contracts\Container\BindingResolutionException
    //      */
    //     protected function resolveClass(ReflectionParameter $parameter)
    //     {
    //         $className = Util::getParameterClassName($parameter);

    //         // First we will check if a default value has been defined for the parameter.
    //         // If it has, and no explicit binding exists, we should return it to avoid
    //         // overriding any of the developer specified defaults for the parameters.
    //         if ($parameter->isDefaultValueAvailable() &&
    //             ! $this->bound($className) &&
    //             $this->findInContextualBindings($className) === null) {
    //             return $parameter->getDefaultValue();
    //         }

    //         try {
    //             return $parameter->isVariadic()
    //                 ? $this->resolveVariadicClass($parameter)
    //                 : $this->make($className);
    //         }

    //         // If we can not resolve the class instance, we will check to see if the value
    //         // is variadic. If it is, we will return an empty array as the value of the
    //         // dependency similarly to how we handle scalar values in this situation.
    //         catch (BindingResolutionException $e) {
    //             if ($parameter->isVariadic()) {
    //                 array_pop($this->with);

    //                 return [];
    //             }

    //             throw $e;
    //         }
    //     }

    //     /**
    //      * Resolve a class based variadic dependency from the container.
    //      *
    //      * @param  \ReflectionParameter  $parameter
    //      * @return mixed
    //      */
    //     protected function resolveVariadicClass(ReflectionParameter $parameter)
    //     {
    //         $className = Util::getParameterClassName($parameter);

    //         $abstract = $this->getAlias($className);

    //         if (! is_array($concrete = $this->getContextualConcrete($abstract))) {
    //             return $this->make($className);
    //         }

    //         return array_map(fn ($abstract) => $this->resolve($abstract), $concrete);
    //     }

    //     /**
    //      * Resolve a dependency based on an attribute.
    //      *
    //      * @param  \ReflectionAttribute  $attribute
    //      * @return mixed
    //      */
    //     public function resolveFromAttribute(ReflectionAttribute $attribute)
    //     {
    //         $handler = $this->contextualAttributes[$attribute->getName()] ?? null;

    //         $instance = $attribute->newInstance();

    //         if (is_null($handler) && method_exists($instance, 'resolve')) {
    //             $handler = $instance->resolve(...);
    //         }

    //         if (is_null($handler)) {
    //             throw new BindingResolutionException("Contextual binding attribute [{$attribute->getName()}] has no registered handler.");
    //         }

    //         return $handler($instance, $this);
    //     }

    //     /**
    //      * Throw an exception that the concrete is not instantiable.
    //      *
    //      * @param  string  $concrete
    //      * @return void
    //      *
    //      * @throws \Illuminate\Contracts\Container\BindingResolutionException
    //      */
    //     protected function notInstantiable($concrete)
    //     {
    //         if (! empty($this->buildStack)) {
    //             $previous = implode(', ', $this->buildStack);

    //             $message = "Target [$concrete] is not instantiable while building [$previous].";
    //         } else {
    //             $message = "Target [$concrete] is not instantiable.";
    //         }

    //         throw new BindingResolutionException($message);
    //     }

    //     /**
    //      * Throw an exception for an unresolvable primitive.
    //      *
    //      * @param  \ReflectionParameter  $parameter
    //      * @return void
    //      *
    //      * @throws \Illuminate\Contracts\Container\BindingResolutionException
    //      */
    //     protected function unresolvablePrimitive(ReflectionParameter $parameter)
    //     {
    //         $message = "Unresolvable dependency resolving [$parameter] in class {$parameter->getDeclaringClass()->getName()}";

    //         throw new BindingResolutionException($message);
    //     }

    //     /**
    //      * Register a new before resolving callback for all types.
    //      *
    //      * @param  \Closure|string  $abstract
    //      * @param  \Closure|null  $callback
    //      * @return void
    //      */
    //     public function beforeResolving($abstract, ?Closure $callback = null)
    //     {
    //         if (is_string($abstract)) {
    //             $abstract = $this->getAlias($abstract);
    //         }

    //         if ($abstract instanceof Closure && is_null($callback)) {
    //             $this->globalBeforeResolvingCallbacks[] = $abstract;
    //         } else {
    //             $this->beforeResolvingCallbacks[$abstract][] = $callback;
    //         }
    //     }

    //     /**
    //      * Register a new resolving callback.
    //      *
    //      * @param  \Closure|string  $abstract
    //      * @param  \Closure|null  $callback
    //      * @return void
    //      */
    //     public function resolving($abstract, ?Closure $callback = null)
    //     {
    //         if (is_string($abstract)) {
    //             $abstract = $this->getAlias($abstract);
    //         }

    //         if (is_null($callback) && $abstract instanceof Closure) {
    //             $this->globalResolvingCallbacks[] = $abstract;
    //         } else {
    //             $this->resolvingCallbacks[$abstract][] = $callback;
    //         }
    //     }

    //     /**
    //      * Register a new after resolving callback for all types.
    //      *
    //      * @param  \Closure|string  $abstract
    //      * @param  \Closure|null  $callback
    //      * @return void
    //      */
    //     public function afterResolving($abstract, ?Closure $callback = null)
    //     {
    //         if (is_string($abstract)) {
    //             $abstract = $this->getAlias($abstract);
    //         }

    //         if ($abstract instanceof Closure && is_null($callback)) {
    //             $this->globalAfterResolvingCallbacks[] = $abstract;
    //         } else {
    //             $this->afterResolvingCallbacks[$abstract][] = $callback;
    //         }
    //     }

    //     /**
    //      * Register a new after resolving attribute callback for all types.
    //      *
    //      * @param  string  $attribute
    //      * @param  \Closure  $callback
    //      * @return void
    //      */
    //     public function afterResolvingAttribute(string $attribute, \Closure $callback)
    //     {
    //         $this->afterResolvingAttributeCallbacks[$attribute][] = $callback;
    //     }

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

    //     /**
    //      * Fire all of the after resolving attribute callbacks.
    //      *
    //      * @param  \ReflectionAttribute[]  $attributes
    //      * @param  mixed  $object
    //      * @return void
    //      */
    //     public function fireAfterResolvingAttributeCallbacks(array $attributes, $object)
    //     {
    //         foreach ($attributes as $attribute) {
    //             if (is_a($attribute->getName(), ContextualAttribute::class, true)) {
    //                 $instance = $attribute->newInstance();

    //                 if (method_exists($instance, 'after')) {
    //                     $instance->after($instance, $object, $this);
    //                 }
    //             }

    //             $callbacks = $this->getCallbacksForType(
    //                 $attribute->getName(), $object, $this->afterResolvingAttributeCallbacks
    //             );

    //             foreach ($callbacks as $callback) {
    //                 $callback($attribute->newInstance(), $object, $this);
    //             }
    //         }
    //     }

    /**
     * Get all callbacks for a given type.
     */
    protected getCallbacksForType(
        abstract: string | Class,
        object: object,
        callbacksPerType: Map<string | Class, ((object: unknown, container: Container) => unknown)[]>,
    ): ((object: unknown, container: Container) => unknown)[] {
        let results: ((object: unknown, container: Container) => unknown)[] = [];

        callbacksPerType.entries().forEach(([type, callbacks]) => {
            if (type === abstract || (typeof type !== 'string' && object instanceof type)) {
                results = array_merge(results, callbacks) as ((object: unknown, container: Container) => unknown)[];
            }
        });

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

    //     /**
    //      * Get the name of the binding the container is currently resolving.
    //      *
    //      * @return class-string|string|null
    //      */
    //     public function currentlyResolving()
    //     {
    //         return array_last($this->buildStack) ?: null;
    //     }

    //     /**
    //      * Get the container's bindings.
    //      *
    //      * @return array
    //      */
    //     public function getBindings()
    //     {
    //         return $this->bindings;
    //     }

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

    //     /**
    //      * Remove a resolved instance from the instance cache.
    //      *
    //      * @param  string  $abstract
    //      * @return void
    //      */
    //     public function forgetInstance($abstract)
    //     {
    //         unset($this->instances[$abstract]);
    //     }

    //     /**
    //      * Clear all of the instances from the container.
    //      *
    //      * @return void
    //      */
    //     public function forgetInstances()
    //     {
    //         $this->instances = [];
    //     }

    //     /**
    //      * Clear all of the scoped instances from the container.
    //      *
    //      * @return void
    //      */
    //     public function forgetScopedInstances()
    //     {
    //         foreach ($this->scopedInstances as $scoped) {
    //             unset($this->instances[$scoped]);
    //         }
    //     }

    //     /**
    //      * Set the callback which determines the current container environment.
    //      *
    //      * @param  (callable(array<int, string>|string): bool|string)|null  $callback
    //      * @return void
    //      */
    //     public function resolveEnvironmentUsing(?callable $callback)
    //     {
    //         $this->environmentResolver = $callback;
    //     }

    //     /**
    //      * Determine the environment for the container.
    //      *
    //      * @param  array<int, string>|string  $environments
    //      * @return bool
    //      */
    //     public function currentEnvironmentIs($environments)
    //     {
    //         return $this->environmentResolver === null
    //             ? false
    //             : call_user_func($this->environmentResolver, $environments);
    //     }

    //     /**
    //      * Flush the container of all bindings and resolved instances.
    //      *
    //      * @return void
    //      */
    //     public function flush()
    //     {
    //         $this->aliases = [];
    //         $this->resolved = [];
    //         $this->bindings = [];
    //         $this->instances = [];
    //         $this->abstractAliases = [];
    //         $this->scopedInstances = [];
    //         $this->checkedForAttributeBindings = [];
    //         $this->checkedForSingletonOrScopedAttributes = [];
    //     }

    //     /**
    //      * Get the globally available instance of the container.
    //      *
    //      * @return static
    //      */
    //     public static function getInstance()
    //     {
    //         return static::$instance ??= new static;
    //     }

    //     /**
    //      * Set the shared instance of the container.
    //      *
    //      * @param  \Illuminate\Contracts\Container\Container|null  $container
    //      * @return \Illuminate\Contracts\Container\Container|static
    //      */
    //     public static function setInstance(?ContainerContract $container = null)
    //     {
    //         return static::$instance = $container;
    //     }

    //     /**
    //      * Determine if a given offset exists.
    //      *
    //      * @param  string  $key
    //      * @return bool
    //      */
    //     public function offsetExists($key): bool
    //     {
    //         return $this->bound($key);
    //     }

    //     /**
    //      * Get the value at a given offset.
    //      *
    //      * @param  string  $key
    //      * @return mixed
    //      */
    //     public function offsetGet($key): mixed
    //     {
    //         return $this->make($key);
    //     }

    //     /**
    //      * Set the value at a given offset.
    //      *
    //      * @param  string  $key
    //      * @param  mixed  $value
    //      * @return void
    //      */
    //     public function offsetSet($key, $value): void
    //     {
    //         $this->bind($key, $value instanceof Closure ? $value : fn () => $value);
    //     }

    //     /**
    //      * Unset the value at a given offset.
    //      *
    //      * @param  string  $key
    //      * @return void
    //      */
    //     public function offsetUnset($key): void
    //     {
    //         unset($this->bindings[$key], $this->instances[$key], $this->resolved[$key]);
    //     }

    //     /**
    //      * Dynamically access container services.
    //      *
    //      * @param  string  $key
    //      * @return mixed
    //      */
    //     public function __get($key)
    //     {
    //         return $this[$key];
    //     }

    //     /**
    //      * Dynamically set container services.
    //      *
    //      * @param  string  $key
    //      * @param  mixed  $value
    //      * @return void
    //      */
    //     public function __set($key, $value)
    //     {
    //         $this[$key] = $value;
    //     }
}
