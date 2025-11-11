import { Class } from '../../types.js';

export default function inject(dependencies: Class[] | string[]): ClassDecorator {
    return (target: Function) => {
        Reflect.defineMetadata('design:paramtypes', dependencies, target);
    };
}
