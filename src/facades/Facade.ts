import { App } from "../App.ts";
import type { Abstract } from "../types.ts";

export abstract class Facade {
  /**
   * Create a proxy for the given container binding.
   */
  public static create<T extends unknown>(abstract: Abstract): T {
    return new Proxy({}, {
      get(_target, method) {
        return (...args: unknown[]) =>
          // deno-lint-ignore no-explicit-any
          (App.getInstance().resolve<T>(abstract) as any)[method](...args);
      },
    }) as T;
  }
}
