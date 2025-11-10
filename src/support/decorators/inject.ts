import { Class } from '../../types/types.js';

export function inject(dependencies: Class[] | string[]): ClassDecorator {
    return (target: Function) => {
        Reflect.defineMetadata('inject', dependencies, target);
    };
}
