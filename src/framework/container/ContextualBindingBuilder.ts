// @ts-nocheck
import Container from '../Container.ts';
import { ContextualBindingBuilder as ContextualBindingBuilderContract } from '../contracts/container/ContextualBindingBuilder.ts';
import { Class } from '../types.ts';

export class ContextualBindingBuilder implements ContextualBindingBuilderContract {
    /**
     * The underlying container instance.
     *
     * @var \Illuminate\Contracts\Container\Container
     */

    protected container: Container;

    /**
     * The concrete instance.
     *
     * @var string|array
     */

    protected concrete: string | Class | any[];

    /**
     * The abstract target.
     *
     * @var string
     */

    protected needs: string | Class;

    /**
     * Create a new contextual binding builder.
     *
     * @param  \Illuminate\Contracts\Container\Container  container
     * @param  string|array  concrete
     */

    public __construct(container: Container, concrete: string | Class | any[]): void {
        // this->concrete = concrete;
        // this->container = container;
    }

    /**
     * Define the abstract target that depends on the context.
     *
     * @param  string  abstract
     * @return this
     */

    public needs(abstract: string | Class): this {
        // this->needs = abstract;
        // return this;
    }

    /**
     * Define the implementation for the contextual binding.
     *
     * @param  \Closure|string|array  implementation
     * @return this
     */

    public give(implementation: Function | string | Class): this {
        // foreach (Util::arrayWrap(this->concrete) as concrete) {
        //     this->container->addContextualBinding(concrete, this->needs, implementation);
        // }
        // return this;
    }

    /**
     * Define tagged services to be used as the implementation for the contextual binding.
     *
     * @param  string  tag
     * @return this
     */

    public giveTagged(tag: string): this {
        // return this->give( (container) use (tag) {
        //     taggedServices = container->tagged(tag);
        //     return is_array(taggedServices) ? taggedServices : iterator_to_array(taggedServices);
        // });
    }

    /**
     * Specify the configuration item to bind as a primitive.
     *
     * @param  string  key
     * @param  mixed  default
     * @return this
     */

    public giveConfig(key: string, defaultValue?: any): this {
        // return this->give(fn (container) => container->get('config')->get(key, default));
    }
}
