import { isClass } from '@balboacodes/chassis';
import { array_merge, array_pop, count, unset } from '@balboacodes/php-utils';
import { default as ContainerContract } from '../contracts/container/Container.ts';
import { Class } from '../types.ts';

export default class Container implements ContainerContract {
    /**
     * The current globally available container (if any).
     */
    protected static instance: Container;

    /**
     * An array of the types that have been resolved.
     */
    protected resolvedTypes: Map<string | Class | symbol, boolean> = new Map();

    /**
     * The container's bindings.
     */
    protected bindings: Map<
        string | Class | symbol,
        { concrete: ((container: Container, parameters?: unknown[]) => unknown) | Class; shared: boolean }
    > = new Map();

    /**
     * The container's method bindings.
     */
    protected methodBindings: Map<string | symbol, (instance: unknown, container: Container) => unknown> = new Map();

    /**
     * The container's shared instances.
     */
    protected instances: Map<string | Class | symbol, unknown> = new Map();

    /**
     * The container's scoped instances.
     */
    protected scopedInstances: (string | Class | symbol)[] = [];

    /**
     * The registered type aliases.
     */
    protected aliases: Map<string | Class | symbol, string | Class | symbol> = new Map();

    /**
     * The registered aliases keyed by the abstract name.
     */
    protected abstractAliases: Map<string | Class | symbol, (string | Class | symbol)[]> = new Map();

    /**
     * The extension closures for services.
     */
    protected extenders: unknown[] = [];

    /**
     * All of the registered tags.
     */
    protected tags: unknown[] = [];

    /**
     * The stack of concretions currently being built.
     */
    protected buildStack: unknown[] = [];

    /**
     * The parameter override stack.
     */
    protected with: unknown[][] = [];

    /**
     * The contextual binding map.
     */
    public contextual: unknown[] = [];

    /**
     * The contextual attribute handlers.
     */
    public contextualAttributes: unknown[] = [];

    /**
     * Whether an abstract class has already had its attributes checked for bindings.
     */
    protected checkedForAttributeBindings: Map<string | Class | symbol, true> = new Map();

    /**
     * Whether a class has already been checked for Singleton or Scoped attributes.
     *
     * @var array<class-string, "scoped"|"singleton"|null>
     */
    protected checkedForSingletonOrScopedAttributes: Map<string | Class | symbol, 'scoped' | 'singleton' | null> =
        new Map();

    /**
     * All of the registered rebound callbacks.
     */
    protected reboundCallbacks: Map<string | Class | symbol, ((container: Container, instance: Class) => unknown)[]> =
        new Map();

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
    protected beforeResolvingCallbacks: Map<string | Class | symbol, (() => unknown)[]> = new Map();

    /**
     * All of the resolving callbacks by class type.
     */
    protected resolvingCallbacks: Map<string | Class | symbol, ((object: unknown, container: Container) => unknown)[]> =
        new Map();

    /**
     * All of the after resolving callbacks by class type.
     */
    protected afterResolvingCallbacks: Map<string | Class | symbol, (() => unknown)[]> = new Map();

    /**
     * All of the after resolving attribute callbacks by class type.
     */
    protected afterResolvingAttributeCallbacks: unknown[] = [];

    /**
     * The callback used to determine the container's environment.
     */
    protected environmentResolver?: (array: string[] | string) => boolean | string;

    /**
     * Define a contextual binding.
     *
     * @param  array|string  $concrete
     * @return \Illuminate\Contracts\Container\ContextualBindingBuilder
     */
    // public when(concrete) {
    // $aliases = [];

    // foreach (Util::arrayWrap($concrete) as $c) {
    //     $aliases[] = $this->getAlias($c);
    // }

    // return new ContextualBindingBuilder($this, $aliases);
    // }

    /**
     * Define a contextual binding based on an attribute.
     *
     * @param  string  $attribute
     * @param  \Closure  $handler
     * @return void
     */
    // public whenHasAttribute(string $attribute, Closure $handler)
    // {
    //     $this->contextualAttributes[$attribute] = $handler;
    // }

    /**
     * Determine if the given abstract type has been bound.
     */
    public bound(abstract: string | Class | symbol): boolean {
        return this.bindings.has(abstract) || this.instances.has(abstract) || this.isAlias(abstract);
    }

    /**
     * {@inheritdoc}
     *
     * @return bool
     */
    // public has(string $id): bool
    // {
    //     return $this->bound($id);
    // }

    /**
     * Determine if the given abstract type has been resolved.
     */
    public resolved(abstract: string | Class | symbol): boolean {
        if (this.isAlias(abstract)) {
            abstract = this.getAlias(abstract);
        }

        return this.resolvedTypes.has(abstract) || this.instances.has(abstract);
    }

    /**
     * Determine if a given type is shared.
     */
    public isShared(abstract: string | Class | symbol): boolean {
        if (this.instances.has(abstract)) {
            return true;
        }

        return !!this.bindings.get(abstract)?.['shared'];

        // if (! class_exists($abstract)) {
        //     return false;
        // }

        // if (($scopedType = $this->getScopedTyped($abstract)) === null) {
        //     return false;
        // }

        // if ($scopedType === 'scoped') {
        //     if (! in_array($abstract, $this->scopedInstances, true)) {
        //         $this->scopedInstances[] = $abstract;
        //     }
        // }

        // return true;
    }

    /**
     * Determine if a ReflectionClass has scoping attributes applied.
     *
     * @param  ReflectionClass<object>|class-string  $reflection
     * @return "singleton"|"scoped"|null
     */
    // protected getScopedTyped(ReflectionClass|string $reflection): ?string
    // {
    //     $className = $reflection instanceof ReflectionClass
    //         ? $reflection->getName()
    //         : $reflection;

    //     if (array_key_exists($className, $this->checkedForSingletonOrScopedAttributes)) {
    //         return $this->checkedForSingletonOrScopedAttributes[$className];
    //     }

    //     try {
    //         $reflection = $reflection instanceof ReflectionClass
    //             ? $reflection
    //             : new ReflectionClass($reflection);
    //     } catch (ReflectionException) {
    //         return $this->checkedForSingletonOrScopedAttributes[$className] = null;
    //     }

    //     $type = null;

    //     if (! empty($reflection->getAttributes(Singleton::class))) {
    //         $type = 'singleton';
    //     } elseif (! empty($reflection->getAttributes(Scoped::class))) {
    //         $type = 'scoped';
    //     }

    //     return $this->checkedForSingletonOrScopedAttributes[$className] = $type;
    // }

    /**
     * Determine if a given string or class is an alias.
     */
    public isAlias(name: string | Class | symbol): boolean {
        return this.aliases.has(name);
    }

    /**
     * Register a binding with the container.
     *
     * TODO: abstract can be a closure
     *
     * @throws {TypeError} if concrete is not a function or string.
     */
    public bind(
        abstract: string | Class | symbol,
        concrete?: ((container: Container, parameters?: unknown[]) => unknown) | Class,
        shared: boolean = false,
    ): void {
        // if ($abstract instanceof Closure) {
        //     return $this->bindBasedOnClosureReturnTypes(
        //         $abstract, $concrete, $shared
        //     );
        // }

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
        if (typeof concrete === 'function' && isClass(concrete)) {
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
        abstract: string | Class | symbol,
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
    public bindMethod(method: string | symbol, callback: (instance: unknown, container: Container) => unknown): void {
        this.methodBindings.set(method, callback);
    }

    /**
     * Get the method binding for the given method.
     */
    public callMethodBinding(method: string, instance: unknown): unknown {
        return this.methodBindings.get(method)?.(instance, this);
    }

    /**
     * Add a contextual binding to the container.
     *
     * @param  string  $concrete
     * @param  \Closure|string  $abstract
     * @param  \Closure|string  $implementation
     * @return void
     */
    // public addContextualBinding($concrete, $abstract, $implementation)
    // {
    //     $this->contextual[$concrete][$this->getAlias($abstract)] = $implementation;
    // }

    /**
     * Register a binding if it hasn't already been registered.
     *
     * TODO: abstract can be a closure
     */
    public bindIf(
        abstract: string | Class | symbol,
        concrete?: ((container: Container, parameters?: unknown[]) => unknown) | Class,
        shared: boolean = false,
    ): void {
        if (!this.bound(abstract)) {
            this.bind(abstract, concrete, shared);
        }
    }

    /**
     * Register a shared binding in the container.
     *
     * TODO: abstract can be a closure
     */
    public singleton(
        abstract: string | Class | symbol,
        concrete?: ((container: Container, parameters?: unknown[]) => unknown) | Class,
    ): void {
        this.bind(abstract, concrete, true);
    }

    /**
     * Register a shared binding if it hasn't already been registered.
     *
     * TODO: abstract can be a closure
     */
    public singletonIf(
        abstract: string | Class | symbol,
        concrete?: ((container: Container, parameters?: unknown[]) => unknown) | Class,
    ): void {
        if (!this.bound(abstract)) {
            this.singleton(abstract, concrete);
        }
    }

    /**
     * Register a scoped binding in the container.
     *
     * @param  \Closure|string  $abstract
     * @param  \Closure|string|null  $concrete
     * @return void
     */
    // public scoped($abstract, $concrete = null)
    // {
    //     $this->scopedInstances[] = $abstract;

    //     $this->singleton($abstract, $concrete);
    // }

    /**
     * Register a scoped binding if it hasn't already been registered.
     *
     * @param  \Closure|string  $abstract
     * @param  \Closure|string|null  $concrete
     * @return void
     */
    // public scopedIf($abstract, $concrete = null)
    // {
    //     if (! $this->bound($abstract)) {
    //         $this->scoped($abstract, $concrete);
    //     }
    // }

    /**
     * Register a binding with the container based on the given Closure's return types.
     *
     * @param  \Closure|string  $abstract
     * @param  \Closure|string|null  $concrete
     * @param  bool  $shared
     * @return void
     */
    // protected bindBasedOnClosureReturnTypes($abstract, $concrete = null, $shared = false)
    // {
    //     $abstracts = $this->closureReturnTypes($abstract);

    //     $concrete = $abstract;

    //     foreach ($abstracts as $abstract) {
    //         $this->bind($abstract, $concrete, $shared);
    //     }
    // }

    /**
     * Get the class names / types of the return type of the given Closure.
     *
     * @param  \Closure  $closure
     * @return list<class-string>
     *
     * @throws \ReflectionException
     */
    // protected closureReturnTypes(Closure $closure)
    // {
    //     $reflection = new ReflectionFunction($closure);

    //     if ($reflection->getReturnType() === null ||
    //         $reflection->getReturnType() instanceof ReflectionIntersectionType) {
    //         return [];
    //     }

    //     $types = $reflection->getReturnType() instanceof ReflectionUnionType
    //         ? $reflection->getReturnType()->getTypes()
    //         : [$reflection->getReturnType()];

    //     return (new Collection($types))
    //         ->reject(fn ($type) => $type->isBuiltin())
    //         ->reject(fn ($type) => in_array($type->getName(), ['static', 'self']))
    //         ->map(fn ($type) => $type->getName())
    //         ->values()
    //         ->all();
    // }

    /**
     * "Extend" an abstract type in the container.
     *
     * @param  string  $abstract
     * @param  \Closure  $closure
     * @return void
     *
     * @throws \InvalidArgumentException
     */
    // public extend($abstract, Closure $closure)
    // {
    //     $abstract = $this->getAlias($abstract);

    //     if (isset($this->instances[$abstract])) {
    //         $this->instances[$abstract] = $closure($this->instances[$abstract], $this);

    //         $this->rebound($abstract);
    //     } else {
    //         $this->extenders[$abstract][] = $closure;

    //         if ($this->resolved($abstract)) {
    //             $this->rebound($abstract);
    //         }
    //     }
    // }

    /**
     * Register an existing instance as shared in the container.
     */
    public instance<TInstance>(abstract: string | Class | symbol, instance: TInstance): TInstance {
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
    protected removeAbstractAlias(searched: string | Class | symbol): void {
        if (!this.aliases.has(searched)) {
            return;
        }

        for (const [abstract, aliases] of this.abstractAliases) {
            for (const [index, alias] of Object.entries(aliases)) {
                if (alias === searched) {
                    unset(this.abstractAliases.get(abstract) ?? [], index);
                }
            }
        }
    }

    /**
     * Assign a set of tags to a given binding.
     *
     * @param  array|string  $abstracts
     * @param  mixed  ...$tags
     * @return void
     */
    // public tag($abstracts, $tags)
    // {
    //     $tags = is_array($tags) ? $tags : array_slice(func_get_args(), 1);

    //     foreach ($tags as $tag) {
    //         if (! isset($this->tags[$tag])) {
    //             $this->tags[$tag] = [];
    //         }

    //         foreach ((array) $abstracts as $abstract) {
    //             $this->tags[$tag][] = $abstract;
    //         }
    //     }
    // }

    /**
     * Resolve all of the bindings for a given tag.
     *
     * @param  string  $tag
     * @return iterable
     */
    // public tagged($tag)
    // {
    //     if (! isset($this->tags[$tag])) {
    //         return [];
    //     }

    //     return new RewindableGenerator(function () use ($tag) {
    //         foreach ($this->tags[$tag] as $abstract) {
    //             yield $this->make($abstract);
    //         }
    //     }, count($this->tags[$tag]));
    // }

    /**
     * Alias a type to a different name.
     *
     * @throws {Error} if alias === abstract
     */
    public alias(abstract: string | Class | symbol, alias: string | Class | symbol): void {
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
    public rebinding(
        abstract: string | Class | symbol,
        callback: (container: Container, instance: Class) => unknown,
    ): unknown {
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
    public refresh(abstract: string | Class | symbol, target: object, method: string): unknown {
        return this.rebinding(abstract, (_app, instance) => {
            // @ts-expect-error: need a better typing
            target[method](instance);
        });
    }

    /**
     * Fire the "rebound" callbacks for the given abstract type.
     */
    protected rebound(abstract: string | Class | symbol): void {
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
    protected getReboundCallbacks(
        abstract: string | Class | symbol,
    ): ((container: Container, instance: Class) => unknown)[] {
        return this.reboundCallbacks.get(abstract) ?? [];
    }

    /**
     * Wrap the given closure such that its dependencies will be injected when executed.
     *
     * @param  \Closure  $callback
     * @param  array  $parameters
     * @return \Closure
     */
    // public wrap(Closure $callback, array $parameters = [])
    // {
    //     return fn () => $this->call($callback, $parameters);
    // }

    /**
     * Call the given Closure / class@method and inject its dependencies.
     *
     * @param  callable|string  $callback
     * @param  array<string, mixed>  $parameters
     * @param  string|null  $defaultMethod
     * @return mixed
     *
     * @throws \InvalidArgumentException
     */
    // public call($callback, array $parameters = [], $defaultMethod = null)
    // {
    //     $pushedToBuildStack = false;

    //     if (($className = $this->getClassForCallable($callback)) && ! in_array(
    //         $className,
    //         $this->buildStack,
    //         true
    //     )) {
    //         $this->buildStack[] = $className;

    //         $pushedToBuildStack = true;
    //     }

    //     $result = BoundMethod::call($this, $callback, $parameters, $defaultMethod);

    //     if ($pushedToBuildStack) {
    //         array_pop($this->buildStack);
    //     }

    //     return $result;
    // }

    /**
     * Get the class name for the given callback, if one can be determined.
     *
     * @param  callable|string  $callback
     * @return string|false
     */
    // protected getClassForCallable($callback)
    // {
    //     if (is_callable($callback) &&
    //         ! ($reflector = new ReflectionFunction($callback(...)))->isAnonymous()) {
    //         return $reflector->getClosureScopeClass()->name ?? false;
    //     }

    //     return false;
    // }

    /**
     * Get a closure to resolve the given type from the container.
     *
     * @template TClass of object
     *
     * @param  string|class-string<TClass>  $abstract
     * @return ($abstract is class-string<TClass> ? \Closure(): TClass : \Closure(): mixed)
     */
    // public factory($abstract)
    // {
    //     return fn () => $this->make($abstract);
    // }

    /**
     * Resolve the given type from the container.
     */
    public make<TClass>(
        abstract: string | Class<TClass> | symbol,
        parameters: unknown[] = [],
    ): typeof abstract extends Class ? TClass : unknown {
        return this.resolve(abstract, parameters);
    }

    /**
     * {@inheritdoc}
     *
     * @template TClass of object
     *
     * @param  string|class-string<TClass>  $id
     * @return ($id is class-string<TClass> ? TClass : mixed)
     */
    // public get(string $id)
    // {
    //     try {
    //         return $this->resolve($id);
    //     } catch (Exception $e) {
    //         if ($this->has($id) || $e instanceof CircularDependencyException) {
    //             throw $e;
    //         }

    //         throw new EntryNotFoundException($id, is_int($e->getCode()) ? $e->getCode() : 0, $e);
    //     }
    // }

    /**
     * Resolve the given type from the container.
     */
    protected resolve<TClass>(
        abstract: string | Class<TClass> | symbol,
        parameters: unknown[] = [],
        raiseEvents: boolean = true,
    ): typeof abstract extends Class ? TClass : unknown {
        // @ts-ignore:
        abstract = this.getAlias(abstract);

        // First we'll fire any event handlers which handle the "before" resolving of
        // specific types. This gives some hooks the chance to add various extends
        // calls to change the resolution of objects that they're interested in.
        if (raiseEvents) {
            this.fireBeforeResolvingCallbacks(abstract, parameters);
        }

        // $concrete = $this->getContextualConcrete($abstract);

        const needsContextualBuild = parameters.length; // || ! is_null($concrete);

        // If an instance of the type is currently being managed as a singleton we'll
        // just return an existing instance instead of instantiating new instances
        // so the developer can keep using the same objects instance every time.
        if (this.instances.has(abstract) && !needsContextualBuild) {
            return this.instances.get(abstract);
        }

        this.with.push(parameters);

        // if (is_null($concrete)) {
        //     $concrete = $this->getConcrete($abstract);
        // }
        const concrete = this.getConcrete(abstract);

        // We're ready to instantiate an instance of the concrete type registered for
        // the binding. This will instantiate the types, as well as resolve any of
        // its "nested" dependencies recursively until all have gotten resolved.
        const object = this.isBuildable(concrete, abstract)
            ? this.build(concrete as ((container: Container, parameters: unknown[]) => Class) | Class)
            : this.make(concrete as string | Class | symbol);

        // If we defined any extenders for this type, we'll need to spin through them
        // and apply them to the object being built. This allows for the extension
        // of services, such as changing configuration or decorating the object.
        // foreach ($this->getExtenders($abstract) as $extender) {
        //     $object = $extender($object, $this);
        // }

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
    protected getConcrete(abstract: string | Class | symbol): unknown {
        // If we don't have a registered resolver or concrete for the type, we'll just
        // assume each type is a concrete name and will attempt to resolve it as is
        // since the container should be able to resolve concretes automatically.
        return this.bindings.get(abstract)?.['concrete'] ?? abstract;

        // if ($this->environmentResolver === null ||
        //     ($this->checkedForAttributeBindings[$abstract] ?? false) || ! is_string($abstract)) {
        //     return $abstract;
        // }

        // return $this->getConcreteBindingFromAttributes($abstract);
    }

    /**
     * Get the concrete binding for an abstract from the Bind attribute.
     *
     * @param  string  $abstract
     * @return mixed
     */
    // protected getConcreteBindingFromAttributes($abstract)
    // {
    //     $this->checkedForAttributeBindings[$abstract] = true;

    //     try {
    //         $reflected = new ReflectionClass($abstract);
    //     } catch (ReflectionException) {
    //         return $abstract;
    //     }

    //     $bindAttributes = $reflected->getAttributes(Bind::class);

    //     if ($bindAttributes === []) {
    //         return $abstract;
    //     }

    //     $concrete = $maybeConcrete = null;

    //     foreach ($bindAttributes as $reflectedAttribute) {
    //         $instance = $reflectedAttribute->newInstance();

    //         if ($instance->environments === ['*']) {
    //             $maybeConcrete = $instance->concrete;

    //             continue;
    //         }

    //         if ($this->currentEnvironmentIs($instance->environments)) {
    //             $concrete = $instance->concrete;

    //             break;
    //         }
    //     }

    //     if ($maybeConcrete !== null && $concrete === null) {
    //         $concrete = $maybeConcrete;
    //     }

    //     if ($concrete === null) {
    //         return $abstract;
    //     }

    //     match ($this->getScopedTyped($reflected)) {
    //         'scoped' => $this->scoped($abstract, $concrete),
    //         'singleton' => $this->singleton($abstract, $concrete),
    //         null => $this->bind($abstract, $concrete),
    //     };

    //     return $this->bindings[$abstract]['concrete'];
    // }

    /**
     * Get the contextual concrete binding for the given abstract.
     *
     * @param  string|callable  $abstract
     * @return \Closure|string|array|null
     */
    // protected getContextualConcrete($abstract)
    // {
    //     if (! is_null($binding = $this->findInContextualBindings($abstract))) {
    //         return $binding;
    //     }

    //     // Next we need to see if a contextual binding might be bound under an alias of the
    //     // given abstract type. So, we will need to check if any aliases exist with this
    //     // type and then spin through them and check for contextual bindings on these.
    //     if (empty($this->abstractAliases[$abstract])) {
    //         return;
    //     }

    //     foreach ($this->abstractAliases[$abstract] as $alias) {
    //         if (! is_null($binding = $this->findInContextualBindings($alias))) {
    //             return $binding;
    //         }
    //     }
    // }

    /**
     * Find the concrete binding for the given abstract in the contextual binding array.
     *
     * @param  string|callable  $abstract
     * @return \Closure|string|null
     */
    // protected findInContextualBindings($abstract)
    // {
    //     return $this->contextual[end($this->buildStack)][$abstract] ?? null;
    // }

    /**
     * Determine if the given concrete is buildable.
     */
    protected isBuildable(concrete: unknown, abstract: string | Class | symbol): boolean {
        return concrete === abstract || typeof concrete === 'function';
    }

    /**
     * Instantiate a concrete instance of the given type.
     */
    public build<TClass>(
        concrete: ((container: Container, parameters: unknown[]) => TClass) | Class<TClass>,
    ): TClass {
        // If the concrete type is actually a Closure, we will just execute it and
        // hand back the results of the functions, which allows functions to be
        // used as resolvers for more fine-tuned resolution of these objects.
        if (!isClass(concrete)) {
            // $this->buildStack[] = spl_object_hash($concrete);

            // try {
            //     return $concrete($this, $this->getLastParameterOverride());
            return concrete(this, this.getLastParameterOverride());
            // } finally {
            //     array_pop($this->buildStack);
            // }
        }

        // try {
        //     $reflector = new ReflectionClass($concrete);
        // } catch (ReflectionException $e) {
        //     throw new BindingResolutionException("Target class [$concrete] does not exist.", 0, $e);
        // }

        // If the type is not instantiable, the developer is attempting to resolve
        // an abstract type such as an Interface or Abstract Class and there is
        // no binding registered for the abstractions so we need to bail out.
        // if (! $reflector->isInstantiable()) {
        //     return $this->notInstantiable($concrete);
        // }

        // if (is_a($concrete, SelfBuilding::class, true) &&
        //     ! in_array($concrete, $this->buildStack, true)) {
        //     return $this->buildSelfBuildingInstance($concrete, $reflector);
        // }

        // $this->buildStack[] = $concrete;

        // $constructor = $reflector->getConstructor();

        // If there are no constructors, that means there are no dependencies then
        // we can just resolve the instances of the objects right away, without
        // resolving any other types or dependencies out of these containers.
        // if (is_null($constructor)) {
        //     array_pop($this->buildStack);

        //     $this->fireAfterResolvingAttributeCallbacks(
        //         $reflector->getAttributes(), $instance = new $concrete
        //     );

        //     return $instance;
        // }

        // $dependencies = $constructor->getParameters();

        // Once we have all the constructor's parameters we can create each of the
        // dependency instances and then use the reflection instances to make a
        // new instance of this class, injecting the created dependencies in.
        // try {
        //     $instances = $this->resolveDependencies($dependencies);
        // } catch (BindingResolutionException $e) {
        //     array_pop($this->buildStack);

        //     throw $e;
        // }

        // array_pop($this->buildStack);

        // $this->fireAfterResolvingAttributeCallbacks(
        //     $reflector->getAttributes(), $instance = $reflector->newInstanceArgs($instances)
        // );

        return new concrete();
    }

    /**
     * Instantiate a concrete instance of the given self building type.
     *
     * @param  \Closure(static, array): TClass|class-string<TClass>  $concrete
     * @param  \ReflectionClass  $reflector
     * @return TClass
     *
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     */
    // protected buildSelfBuildingInstance($concrete, $reflector)
    // {
    //     if (! method_exists($concrete, 'newInstance')) {
    //         throw new BindingResolutionException("No newInstance method exists for [$concrete].");
    //     }

    //     $this->buildStack[] = $concrete;

    //     $instance = $this->call([$concrete, 'newInstance']);

    //     array_pop($this->buildStack);

    //     $this->fireAfterResolvingAttributeCallbacks(
    //         $reflector->getAttributes(), $instance
    //     );

    //     return $instance;
    // }

    /**
     * Resolve all of the dependencies from the ReflectionParameters.
     *
     * @param  \ReflectionParameter[]  $dependencies
     * @return array
     *
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     */
    // protected resolveDependencies(array $dependencies)
    // {
    //     $results = [];

    //     foreach ($dependencies as $dependency) {
    //         // If the dependency has an override for this particular build we will use
    //         // that instead as the value. Otherwise, we will continue with this run
    //         // of resolutions and let reflection attempt to determine the result.
    //         if ($this->hasParameterOverride($dependency)) {
    //             $results[] = $this->getParameterOverride($dependency);

    //             continue;
    //         }

    //         $result = null;

    //         if (! is_null($attribute = Util::getContextualAttributeFromDependency($dependency))) {
    //             $result = $this->resolveFromAttribute($attribute);
    //         }

    //         // If the class is null, it means the dependency is a string or some other
    //         // primitive type which we can not resolve since it is not a class and
    //         // we will just bomb out with an error since we have no-where to go.
    //         $result ??= is_null(Util::getParameterClassName($dependency))
    //             ? $this->resolvePrimitive($dependency)
    //             : $this->resolveClass($dependency);

    //         $this->fireAfterResolvingAttributeCallbacks($dependency->getAttributes(), $result);

    //         if ($dependency->isVariadic()) {
    //             $results = array_merge($results, $result);
    //         } else {
    //             $results[] = $result;
    //         }
    //     }

    //     return $results;
    // }

    /**
     * Determine if the given dependency has a parameter override.
     *
     * @param  \ReflectionParameter  $dependency
     * @return bool
     */
    // protected hasParameterOverride($dependency)
    // {
    //     return array_key_exists(
    //         $dependency->name, $this->getLastParameterOverride()
    //     );
    // }

    /**
     * Get a parameter override for a dependency.
     *
     * @param  \ReflectionParameter  $dependency
     * @return mixed
     */
    // protected getParameterOverride($dependency)
    // {
    //     return $this->getLastParameterOverride()[$dependency->name];
    // }

    /**
     * Get the last parameter override.
     */
    protected getLastParameterOverride(): unknown[] {
        return this.with.length ? this.with[this.with.length - 1] : [];
    }

    /**
     * Resolve a non-class hinted primitive dependency.
     *
     * @param  \ReflectionParameter  $parameter
     * @return mixed
     *
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     */
    // protected resolvePrimitive(ReflectionParameter $parameter)
    // {
    //     if (! is_null($concrete = $this->getContextualConcrete('$'.$parameter->getName()))) {
    //         return Util::unwrapIfClosure($concrete, $this);
    //     }

    //     if ($parameter->isDefaultValueAvailable()) {
    //         return $parameter->getDefaultValue();
    //     }

    //     if ($parameter->isVariadic()) {
    //         return [];
    //     }

    //     if ($parameter->hasType() && $parameter->allowsNull()) {
    //         return null;
    //     }

    //     $this->unresolvablePrimitive($parameter);
    // }

    /**
     * Resolve a class based dependency from the container.
     *
     * @param  \ReflectionParameter  $parameter
     * @return mixed
     *
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     */
    // protected resolveClass(ReflectionParameter $parameter)
    // {
    //     $className = Util::getParameterClassName($parameter);

    //     // First we will check if a default value has been defined for the parameter.
    //     // If it has, and no explicit binding exists, we should return it to avoid
    //     // overriding any of the developer specified defaults for the parameters.
    //     if ($parameter->isDefaultValueAvailable() &&
    //         ! $this->bound($className) &&
    //         $this->findInContextualBindings($className) === null) {
    //         return $parameter->getDefaultValue();
    //     }

    //     try {
    //         return $parameter->isVariadic()
    //             ? $this->resolveVariadicClass($parameter)
    //             : $this->make($className);
    //     }

    //     // If we can not resolve the class instance, we will check to see if the value
    //     // is variadic. If it is, we will return an empty array as the value of the
    //     // dependency similarly to how we handle scalar values in this situation.
    //     catch (BindingResolutionException $e) {
    //         if ($parameter->isVariadic()) {
    //             array_pop($this->with);

    //             return [];
    //         }

    //         throw $e;
    //     }
    // }

    /**
     * Resolve a class based variadic dependency from the container.
     *
     * @param  \ReflectionParameter  $parameter
     * @return mixed
     */
    // protected resolveVariadicClass(ReflectionParameter $parameter)
    // {
    //     $className = Util::getParameterClassName($parameter);

    //     $abstract = $this->getAlias($className);

    //     if (! is_array($concrete = $this->getContextualConcrete($abstract))) {
    //         return $this->make($className);
    //     }

    //     return array_map(fn ($abstract) => $this->resolve($abstract), $concrete);
    // }

    /**
     * Resolve a dependency based on an attribute.
     *
     * @param  \ReflectionAttribute  $attribute
     * @return mixed
     */
    // public resolveFromAttribute(ReflectionAttribute $attribute)
    // {
    //     $handler = $this->contextualAttributes[$attribute->getName()] ?? null;

    //     $instance = $attribute->newInstance();

    //     if (is_null($handler) && method_exists($instance, 'resolve')) {
    //         $handler = $instance->resolve(...);
    //     }

    //     if (is_null($handler)) {
    //         throw new BindingResolutionException("Contextual binding attribute [{$attribute->getName()}] has no registered handler.");
    //     }

    //     return $handler($instance, $this);
    // }

    /**
     * Throw an exception that the concrete is not instantiable.
     *
     * @param  string  $concrete
     * @return void
     *
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     */
    // protected notInstantiable($concrete)
    // {
    //     if (! empty($this->buildStack)) {
    //         $previous = implode(', ', $this->buildStack);

    //         $message = "Target [$concrete] is not instantiable while building [$previous].";
    //     } else {
    //         $message = "Target [$concrete] is not instantiable.";
    //     }

    //     throw new BindingResolutionException($message);
    // }

    /**
     * Throw an exception for an unresolvable primitive.
     *
     * @param  \ReflectionParameter  $parameter
     * @return void
     *
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     */
    // protected unresolvablePrimitive(ReflectionParameter $parameter)
    // {
    //     $message = "Unresolvable dependency resolving [$parameter] in class {$parameter->getDeclaringClass()->getName()}";

    //     throw new BindingResolutionException($message);
    // }

    /**
     * Register a new before resolving callback for all types.
     */
    public beforeResolving(abstract: (() => unknown) | string | Class | symbol, callback?: () => unknown): void {
        if (typeof abstract !== 'function' || isClass(abstract)) {
            abstract = this.getAlias(abstract);
        }

        if (
            typeof abstract === 'function' && !isClass(abstract) && callback === undefined
        ) {
            this.globalBeforeResolvingCallbacks.push(abstract);
        } else {
            if (!this.beforeResolvingCallbacks.has(abstract as string | Class | symbol)) {
                this.beforeResolvingCallbacks.set(abstract as string | Class | symbol, []);
            }

            this.beforeResolvingCallbacks.get(abstract as string | Class | symbol)?.push(callback as () => unknown);
        }
    }

    /**
     * Register a new resolving callback.
     */
    public resolving(
        abstract: ((object: unknown, container: Container) => unknown) | string | Class | symbol,
        callback?: (object: unknown, container: Container) => unknown,
    ): void {
        if (typeof abstract !== 'function' || isClass(abstract)) {
            abstract = this.getAlias(abstract);
        }

        if (typeof abstract === 'function' && !isClass(abstract) && callback === undefined) {
            this.globalResolvingCallbacks.push(abstract);
        } else {
            if (!this.resolvingCallbacks.has(abstract as string | Class | symbol)) {
                this.resolvingCallbacks.set(abstract as string | Class | symbol, []);
            }

            this.resolvingCallbacks.get(abstract as string | Class | symbol)?.push(
                callback as (object: unknown, container: Container) => unknown,
            );
        }
    }

    /**
     * Register a new after resolving callback for all types.
     */
    public afterResolving(abstract: (() => unknown) | string | Class | symbol, callback?: () => unknown): void {
        if (typeof abstract !== 'function' || isClass(abstract)) {
            abstract = this.getAlias(abstract);
        }

        if (typeof abstract === 'function' && !isClass(abstract) && callback === undefined) {
            this.globalAfterResolvingCallbacks.push(abstract);
        } else {
            if (!this.afterResolvingCallbacks.has(abstract as string | Class | symbol)) {
                this.afterResolvingCallbacks.set(abstract as string | Class | symbol, []);
            }

            this.afterResolvingCallbacks.get(abstract as string | Class | symbol)?.push(callback as () => unknown);
        }
    }

    /**
     * Register a new after resolving attribute callback for all types.
     *
     * @param  string  $attribute
     * @param  \Closure  $callback
     * @return void
     */
    // public afterResolvingAttribute(string $attribute, \Closure $callback)
    // {
    //     $this->afterResolvingAttributeCallbacks[$attribute][] = $callback;
    // }

    /**
     * Fire all of the before resolving callbacks.
     */
    protected fireBeforeResolvingCallbacks(abstract: string | Class | symbol, parameters: unknown[] = []): void {
        this.fireBeforeCallbackArray(abstract, parameters, this.globalBeforeResolvingCallbacks);

        for (const [type, callbacks] of this.beforeResolvingCallbacks) {
            if (type === abstract || (isClass(type) && abstract instanceof type)) {
                this.fireBeforeCallbackArray(abstract, parameters, callbacks);
            }
        }
    }

    /**
     * Fire an array of callbacks with an object.
     */
    protected fireBeforeCallbackArray(
        abstract: string | Class | symbol,
        parameters: unknown[],
        callbacks: ((abstract: string | Class | symbol, parameters: unknown[], container: Container) => unknown)[],
    ): void {
        for (const callback of callbacks) {
            callback(abstract, parameters, this);
        }
    }

    /**
     * Fire all of the resolving callbacks.
     */
    protected fireResolvingCallbacks(abstract: string | Class | symbol, object: unknown): void {
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
    protected fireAfterResolvingCallbacks(abstract: string | Class | symbol, object: unknown): void {
        this.fireCallbackArray(object, this.globalAfterResolvingCallbacks);

        this.fireCallbackArray(
            object,
            this.getCallbacksForType(abstract, object as object, this.afterResolvingCallbacks),
        );
    }

    /**
     * Fire all of the after resolving attribute callbacks.
     *
     * @param  \ReflectionAttribute[]  $attributes
     * @param  mixed  $object
     * @return void
     */
    // public fireAfterResolvingAttributeCallbacks(array $attributes, $object)
    // {
    //     foreach ($attributes as $attribute) {
    //         if (is_a($attribute->getName(), ContextualAttribute::class, true)) {
    //             $instance = $attribute->newInstance();

    //             if (method_exists($instance, 'after')) {
    //                 $instance->after($instance, $object, $this);
    //             }
    //         }

    //         $callbacks = $this->getCallbacksForType(
    //             $attribute->getName(), $object, $this->afterResolvingAttributeCallbacks
    //         );

    //         foreach ($callbacks as $callback) {
    //             $callback($attribute->newInstance(), $object, $this);
    //         }
    //     }
    // }

    /**
     * Get all callbacks for a given type.
     */
    protected getCallbacksForType(
        abstract: string | Class | symbol,
        object: object,
        callbacksPerType: Map<string | Class | symbol, ((object: unknown, container: Container) => unknown)[]>,
    ): ((object: unknown, container: Container) => unknown)[] {
        let results: ((object: unknown, container: Container) => unknown)[] = [];

        for (const [type, callbacks] of callbacksPerType) {
            if (type === abstract || (isClass(type) && object instanceof type)) {
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
     * Get the name of the binding the container is currently resolving.
     *
     * @return class-string|string|null
     */
    // public currentlyResolving()
    // {
    //     return array_last($this->buildStack) ?: null;
    // }

    /**
     * Get the container's bindings.
     */
    public getBindings(): typeof this.bindings {
        return this.bindings;
    }

    /**
     * Get the alias for an abstract if available.
     */
    public getAlias(abstract: string | Class | symbol): string | Class | symbol {
        return this.aliases.has(abstract) ? this.getAlias(this.aliases.get(abstract)!) : abstract;
    }

    /**
     * Get the extender callbacks for a given type.
     *
     * @param  string  $abstract
     * @return array
     */
    // protected getExtenders($abstract)
    // {
    //     return $this->extenders[$this->getAlias($abstract)] ?? [];
    // }

    /**
     * Remove all of the extender callbacks for a given type.
     *
     * @param  string  $abstract
     * @return void
     */
    // public forgetExtenders($abstract)
    // {
    //     unset($this->extenders[$this->getAlias($abstract)]);
    // }

    /**
     * Drop all of the stale instances and aliases.
     */
    protected dropStaleInstances(abstract: string | Class | symbol): void {
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
     * Clear all of the scoped instances from the container.
     *
     * @return void
     */
    // public forgetScopedInstances()
    // {
    //     foreach ($this->scopedInstances as $scoped) {
    //         unset($this->instances[$scoped]);
    //     }
    // }

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
        this.scopedInstances = [];
        this.checkedForAttributeBindings.clear();
        this.checkedForSingletonOrScopedAttributes.clear();
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
    public static setInstance(container: ContainerContract): Container {
        return Container.instance = container;
    }
}
