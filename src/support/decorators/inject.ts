import { Class } from '../../types.ts';

export default function inject(dependencies: Class[] | string[]): ClassDecorator {
    return (target: Function) => {
        Reflect.defineMetadata('design:paramtypes', dependencies, target);
    };
}
