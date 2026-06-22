import type { Class } from "../types.ts";

function defineTrait(target: unknown, trait: unknown, key: string) {
  const descriptor = Object.getOwnPropertyDescriptor(trait, key);

  if (descriptor) {
    Object.defineProperty(target, key, descriptor);
  }
}

export function use(...traits: Class[]): ClassDecorator {
  // deno-lint-ignore ban-types
  return (target: Function) => {
    for (const trait of traits) {
      const targets = [
        [target, trait], // Static properties
        [target.prototype, trait.prototype], // Instance properties
      ];

      targets.forEach(([target, trait]) => {
        for (const key of Object.getOwnPropertyNames(trait)) {
          if (
            key === "constructor" || key === "prototype" || key === "length" ||
            key === "name"
          ) {
            continue;
          }

          defineTrait(target, trait, key);
        }
      });
    }
  };
}
