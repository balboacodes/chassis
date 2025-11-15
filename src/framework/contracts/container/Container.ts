import { Class } from '../../types.ts';
import { ContainerInterface } from '../psr/ContainerInterface.ts';
import { ContextualBindingBuilder } from './ContextualBindingBuilder.ts';

export interface Container extends ContainerInterface {
    /**
     * {@inheritdoc}
     *
     * @template TClass of object
     *
     * @param  string|class-string<TClass>  id
     * @return (id is class-string<TClass> ? TClass : mixed)
     */
    get<TClass extends string | Class<TClass>>(id: TClass): TClass extends Class ? TClass : any;

    /**
     * Determine if the given abstract type has been bound.
     *
     * @param  string  abstract
     * @return bool
     */
    bound(abstract: string | Class): boolean;

    /**
     * Alias a type to a different name.
     *
     * @param  string  abstract
     * @param  string  alias
     * @return void
     *
     * @throws \LogicException
     */
    alias(abstract: string | Class, alias: string): void;

    /**
     * Assign a set of tags to a given binding.
     *
     * @param  array|string  abstracts
     * @param  mixed  ...tags
     * @return void
     */
    tag(abstracts: string | Class | (string | Class)[], ...tags: string[]): void;

    /**
     * Resolve all of the bindings for a given tag.
     *
     * @param  string  tag
     * @return iterable
     */
    tagged(tag: string): (string | Class)[];

    /**
     * Register a binding with the container.
     *
     * @param  \Closure|string  abstract
     * @param  \Closure|string|null  concrete
     * @param  bool|null  shared = false
     * @return void
     */
    bind(abstract: Function | string | Class, concrete?: Function | Class, shared?: boolean): void;

    /**
     * Bind a callback to resolve with Container::call.
     *
     * @param  array|string  method
     * @param  \Closure  callback
     * @return void
     */
    bindMethod(method: any[] | string, callback: Function): void;

    /**
     * Register a binding if it hasn't already been registered.
     *
     * @param  \Closure|string  abstract
     * @param  \Closure|string|null  concrete
     * @param  bool  shared = false
     * @return void
     */
    bindIf(abstract: Function | string | Class, concrete?: Function | string | Class, shared?: boolean): void;

    /**
     * Register a shared binding in the container.
     *
     * @param  \Closure|string  abstract
     * @param  \Closure|string|null  concrete
     * @return void
     */
    singleton(abstract: Function | string | Class, concrete?: Function | string | Class): void;

    /**
     * Register a shared binding if it hasn't already been registered.
     *
     * @param  \Closure|string  abstract
     * @param  \Closure|string|null  concrete
     * @return void
     */
    singletonIf(abstract: Function | string | Class, concrete?: Function | string): void;

    /**
     * Register a scoped binding in the container.
     *
     * @param  \Closure|string  abstract
     * @param  \Closure|string|null  concrete
     * @return void
     */
    scoped(abstract: Function | string | Class, concrete?: Function | string | Class): void;

    /**
     * Register a scoped binding if it hasn't already been registered.
     *
     * @param  \Closure|string  abstract
     * @param  \Closure|string|null  concrete
     * @return void
     */
    scopedIf(abstract: Function | string | Class, concrete?: Function | string | Class): void;

    /**
     * "Extend" an abstract type in the container.
     *
     * @param  \Closure|string  abstract
     * @param  \Closure  closure
     * @return void
     *
     * @throws \InvalidArgumentException
     */
    extend(abstract: Function | string | Class, closure: Function): void;

    /**
     * Register an existing instance as shared in the container.
     *
     * @template TInstance of mixed
     *
     * @param  \Closure|string  abstract
     * @param  TInstance  instance
     * @return TInstance
     */
    instance<TInstance>(abstract: Function | string | Class, instance: TInstance): TInstance;

    /**
     * Add a contextual binding to the container.
     *
     * @param  string  concrete
     * @param  \Closure|string  abstract
     * @param  \Closure|string  implementation
     * @return void
     */
    addContextualBinding(
        concrete: string | Class,
        abstract: Function | string | Class,
        implementation: Function | string | Class,
    ): void;

    /**
     * Define a contextual binding.
     *
     * @param  string|array  concrete
     * @return \Illuminate\Contracts\Container\ContextualBindingBuilder
     */
    when(concrete: string | Class | (string | Class)[]): ContextualBindingBuilder;

    /**
     * Get a closure to resolve the given type from the container.
     *
     * @template TClass of object
     *
     * @param  string|class-string<TClass>  abstract
     * @return (abstract is class-string<TClass> ? \Closure(): TClass : \Closure(): mixed)
     */
    factory<TClass extends string | Class<TClass>>(abstract: TClass): TClass extends Class ? () => TClass : () => any;

    /**
     * Flush the container of all bindings and resolved instances.
     *
     * @return void
     */
    flush(): void;

    /**
     * Resolve the given type from the container.
     *
     * @template TClass of object
     *
     * @param  string|class-string<TClass>  abstract
     * @param  array  parameters = []
     * @return (abstract is class-string<TClass> ? TClass : mixed)
     *
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     */
    make<TClass extends string | Class<TClass>>(
        abstract: TClass,
        parameters?: any[],
    ): TClass extends Class ? TClass : any;

    /**
     * Call the given Closure / class@method and inject its dependencies.
     *
     * @param  callable|string  callback
     * @param  array  parameters = []
     * @param  string|null  defaultMethod
     * @return mixed
     */
    call(callback: Function, parameters?: any[], defaultMethod?: string): any;

    /**
     * Determine if the given abstract type has been resolved.
     *
     * @param  string  abstract
     * @return bool
     */
    resolved(abstract: string | Class): boolean;

    /**
     * Register a new before resolving callback.
     *
     * @param  \Closure|string  abstract
     * @param  \Closure|null  callback
     * @return void
     */
    beforeResolving(abstract: Function | string | Class, callback?: Function): void;

    /**
     * Register a new resolving callback.
     *
     * @param  \Closure|string  abstract
     * @param  \Closure|null  callback
     * @return void
     */
    resolving(abstract: Function | string | Class, callback?: Function): void;

    /**
     * Register a new after resolving callback.
     *
     * @param  \Closure|string  abstract
     * @param  \Closure|null  callback
     * @return void
     */
    afterResolving(abstract: Function | string | Class, callback?: Function): void;
}
