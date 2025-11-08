import { Class } from './types.js';

export function inject(dependencies: Class[]): ClassDecorator {
    return (target: Function) => {
        Reflect.defineMetadata('inject', dependencies, target);
    };
}
