import { Middleware } from '../middleware/Middleware.ts';
import { Abstract, Class } from '../types.ts';
import { Facade } from './Facade.ts';

interface App {
    /**
     * Get the application's global middleware.
     */
    getMiddleware(): Class<Middleware>[];
    /**
     * Register a container binding.
     */
    bind(abstract: Abstract, concrete?: unknown): void;
    /**
     * Register a singleton container binding.
     */
    singleton(abstract: Abstract, concrete?: unknown): void;
    /**
     * Resolve a container binding.
     */
    resolve<T = unknown>(abstract: Abstract, parameters?: unknown[]): T;
    /**
     * Delete a container binding.
     */
    forget(abstract: Abstract): void;
    /**
     * Clear all container bindings.
     */
    flush(): void;
}

export const App = Facade.createProxy<App>();
