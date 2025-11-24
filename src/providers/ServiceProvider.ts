import { Container } from '../Container.ts';
import { Abstract } from '../types.ts';

export abstract class ServiceProvider {
    /**
     * The bindings to register with the container.
     */
    public bindings: Map<Abstract, unknown> = new Map();

    /**
     * The singletons to register with the container.
     */
    public singletons: Map<Abstract, unknown> = new Map();

    /**
     * Create a service provider instance.
     */
    public constructor(
        /**
         * The current application instance.
         */
        protected app: Container,
    ) {}

    /**
     * Register service provider.
     */
    public register(): void | Promise<void> {}

    /**
     * Boot service provider.
     */
    public boot(): void | Promise<void> {}
}
