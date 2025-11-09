import { Class } from '../../types.js';

export function inject(dependencies: Class[] | string[]): ClassDecorator {
    return (target: Function) => {
        Reflect.defineMetadata('inject', dependencies, target);
    };
}
