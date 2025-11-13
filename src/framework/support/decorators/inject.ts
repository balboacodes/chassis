/**
 * Inject dependencies into a class constructor or method based on its parameter types. Currently works for controller
 * constructors and methods, service provider constructors and boot methods, and middleware constructors. Note: only
 * classes are resolved from the container. If other parameter types are used, it will return an empty object or
 * undefined.
 */
// @ts-expect-error
export default function inject(target: any, property?: string, descriptor?: PropertyDescriptor): void {}
