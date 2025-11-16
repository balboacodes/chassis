import { FILTER_VALIDATE_BOOLEAN, filter_var, intval } from '@balboacodes/php-utils';
import { Request as ExpressRequest } from 'express';
import Str from './support/Str.ts';
import Stringable from './support/Stringable.ts';

interface Request extends ExpressRequest {}

class Request {
    public constructor(request: ExpressRequest) {
        Object.assign(this, request);
        this.query = request.query;
    }

    public all(): {} {
        // @ts-expect-error
        return { ...this.query, ...this.body, file: this.file, files: this.files };
    }

    public input(key: string, defaultValue?: any): any {
        const inputs = {
            ...this.query,
            ...this.body,
            // @ts-expect-error
            file: this.file,
            // @ts-expect-error
            files: this.files,
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

export default Request;
