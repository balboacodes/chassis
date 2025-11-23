import { isClass } from './helpers.ts';
import { Abstract } from './types.ts';

export class Container {
    /**
     * The registered container bindings.
     */
    public bindings: Map<Abstract, unknown> = new Map();

    /**
     * The registered singleton container bindings.
     */
    public singletons: Map<Abstract, unknown> = new Map();

    /**
     * Register a container binding.
     */
    public bind(abstract: Abstract, concrete?: unknown): void {
        this.bindings.set(abstract, concrete ?? abstract);
    }

    /**
     * Register a singleton container binding.
     */
    public singleton(abstract: Abstract, concrete?: unknown): void {
        this.bindings.set(abstract, concrete ?? abstract);
        this.singletons.set(abstract, undefined);
    }

    /**
     * Resolve a container binding.
     */
    public resolve(abstract: Abstract, parameters?: unknown[]): unknown {
        const singleton = this.singletons.get(abstract);

        if (singleton !== undefined) {
            return singleton;
        }

        let concrete = this.bindings.get(abstract);

        if (concrete === undefined) {
            throw new Error('Abstract has not been bound');
        }

        if (isClass(concrete)) {
            concrete = parameters ? new concrete(...parameters) : new concrete();
        } else if (typeof concrete === 'function') {
            concrete = parameters ? concrete(...parameters) : concrete();
        }

        if (singleton) {
            this.singletons.set(abstract, concrete);
        }

        return concrete;
    }

    /**
     * Delete a container binding.
     */
    public forget(abstract: Abstract): void {
        this.bindings.delete(abstract);
        this.singletons.delete(abstract);
    }

    /**
     * Clear all container bindings.
     */
    public flush(): void {
        this.bindings.clear();
        this.singletons.clear();
    }
}
