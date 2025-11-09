type Class<T = any> = new (...args: any[]) => T;

function defineTrait(target: any, trait: any, key: string) {
    const descriptor = Object.getOwnPropertyDescriptor(trait, key);

    if (descriptor) {
        Object.defineProperty(target, key, descriptor);
    }
}

export function use(...traits: Class[]): ClassDecorator {
    return (target: Function) => {
        for (const trait of traits) {
            const targets = [
                [target, trait], // Static members.
                [target.prototype, trait.prototype], // Instance members.
            ];

            targets.forEach(([target, trait]) => {
                for (const key of Object.getOwnPropertyNames(trait)) {
                    if (key === 'constructor' || key === 'prototype' || key === 'length' || key === 'name') {
                        continue;
                    }

                    defineTrait(target, trait, key);
                }
            });
        }
    };
}
