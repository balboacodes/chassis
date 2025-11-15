import { Class } from '../../types.ts';

export interface ContextualBindingBuilder {
    /**
     * Define the abstract target that depends on the context.
     *
     * @param  string  abstract
     * @return this
     */
    needs(abstract: Class | string): this;

    /**
     * Define the implementation for the contextual binding.
     *
     * @param  \Closure|string|array  implementation
     * @return this
     */
    give(implementation: Function | Class | string | (Class | string)[]): this;

    /**
     * Define tagged services to be used as the implementation for the contextual binding.
     *
     * @param  string  tag
     * @return this
     */
    giveTagged(tag: string): this;

    /**
     * Specify the configuration item to bind as a primitive.
     *
     * @param  string  key
     * @param  mixed  default
     * @return this
     */
    giveConfig(key: string, defaultValue?: any): this;
}
