import { isClass } from "./helpers.ts";
import type { Abstract } from "./types.ts";

export class Container {
  /**
   * The registered container bindings.
   */
  protected bindings: Map<Abstract, unknown> = new Map();

  /**
   * The registered singleton container bindings.
   */
  protected singletons: Map<Abstract, unknown> = new Map();

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
  public resolve<T = unknown>(
    abstract: Abstract,
    parameters: unknown[] = [],
  ): T {
    const hasSingleton = this.singletons.has(abstract);
    const singleton = this.singletons.get(abstract);

    if (hasSingleton && singleton !== undefined) {
      return singleton as T;
    }

    let concrete = this.bindings.get(abstract);

    if (isClass(concrete)) {
      concrete = new concrete(...parameters);
    } else if (typeof concrete === "function") {
      concrete = concrete(...parameters);
    }

    if (hasSingleton) {
      this.singletons.set(abstract, concrete);
    }

    return concrete as T;
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
