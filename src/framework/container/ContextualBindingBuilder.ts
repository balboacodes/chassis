import Container from '../contracts/container/Container.ts';
import { default as ContextualBindingBuilderContract } from '../contracts/container/ContextualBindingBuilder.ts';
import { Class } from '../types.ts';

export default class ContextualBindingBuilder implements ContextualBindingBuilderContract {
    /**
     * The underlying container instance.
     */
    protected container: Container;

    /**
     * The concrete instance.
     */
    protected concrete: string | Class | symbol | (string | Class | symbol)[];

    /**
     * The abstract target.
     */
    protected needs?: string | Class | symbol;

    /**
     * Create a new contextual binding builder.
     */
    public constructor(container: Container, concrete: string | Class | symbol | (string | Class | symbol)[]) {
        this.concrete = concrete;
        this.container = container;
    }

    //     /**
    //      * Define the abstract target that depends on the context.
    //      *
    //      * @param  string  $abstract
    //      * @return $this
    //      */
    //     public function needs($abstract)
    //     {
    //         $this->needs = $abstract;

    //         return $this;
    //     }

    //     /**
    //      * Define the implementation for the contextual binding.
    //      *
    //      * @param  \Closure|string|array  $implementation
    //      * @return $this
    //      */
    //     public function give($implementation)
    //     {
    //         foreach (Util::arrayWrap($this->concrete) as $concrete) {
    //             $this->container->addContextualBinding($concrete, $this->needs, $implementation);
    //         }

    //         return $this;
    //     }

    //     /**
    //      * Define tagged services to be used as the implementation for the contextual binding.
    //      *
    //      * @param  string  $tag
    //      * @return $this
    //      */
    //     public function giveTagged($tag)
    //     {
    //         return $this->give(function ($container) use ($tag) {
    //             $taggedServices = $container->tagged($tag);

    //             return is_array($taggedServices) ? $taggedServices : iterator_to_array($taggedServices);
    //         });
    //     }

    //     /**
    //      * Specify the configuration item to bind as a primitive.
    //      *
    //      * @param  string  $key
    //      * @param  mixed  $default
    //      * @return $this
    //      */
    //     public function giveConfig($key, $default = null)
    //     {
    //         return $this->give(fn ($container) => $container->get('config')->get($key, $default));
    //     }
}
