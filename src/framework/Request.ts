import { FILTER_VALIDATE_BOOLEAN, filter_var, intval } from '@balboacodes/php-utils';
import { Request as ExpressRequest } from 'express';
import Str from './support/Str.ts';
import Stringable from './support/Stringable.ts';

export default class Request {
    public constructor(public request: ExpressRequest) {}

    public all(): {} {
        // @ts-expect-error
        return { ...this.request.query, ...this.request.body, file: this.request.file, files: this.request.files };
    }

    public input(key: string, defaultValue?: any): any {
        const inputs = {
            ...this.request.query,
            ...this.request.body,
            // @ts-expect-error
            file: this.request.file,
            // @ts-expect-error
            files: this.request.files,
        };

        return inputs[key] ?? defaultValue;
    }

    public string(key: string, defaultValue?: any): Stringable {
        return Str.of(this.input(key ?? defaultValue));
    }

    public integer(key: string, defaultValue = 0): number {
        return intval(this.input(key, defaultValue));
    }

    public boolean(key: string, defaultValue = false): boolean {
        return filter_var(this.input(key, defaultValue), FILTER_VALIDATE_BOOLEAN);
    }

    public date(key: string): Date | null {
        const input = this.input(key);
        if (!input) return null;

        const parsed = Date.parse(input);
        return Number.isNaN(parsed) ? null : new Date(parsed);
    }
}
