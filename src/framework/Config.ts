import { Arr } from '@balboacodes/laravel-helpers';

export class Config {
    public constructor(protected items: Record<string, unknown> = {}) {}

    public get(key?: string): unknown {
        return Arr.get(this.items, key);
    }

    public set(key?: string): unknown {
        return Arr.set(this.items, key);
    }
}
