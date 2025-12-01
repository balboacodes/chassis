import { Arr } from '@balboacodes/laravel-helpers';
import { Cookie, setCookie } from '@std/http/cookie';
import { type Header } from '@std/http/unstable-header';

export class ChassisResponse extends Response {
    /**
     * Add headers to the response.
     */
    public header(header: Header | Record<Header, string>, value?: string): Response {
        if (typeof header === 'string' && value === undefined) {
            throw new Error('Value is required');
        }

        header = (typeof header === 'string' ? { [header]: value } : header) as Record<Header, string>;
        const headers = new Headers(this.headers);

        for (const [h, v] of Object.entries(header)) {
            headers.append(h, v);
        }

        return new ChassisResponse(this.body, {
            status: this.status,
            statusText: this.statusText,
            headers,
        });
    }

    /**
     * Add cookies to the response.
     */
    public cookie(cookie: Cookie | Cookie[]): Response {
        cookie = Arr.wrap(cookie);
        const headers = new Headers(this.headers);

        for (const c of cookie) {
            setCookie(headers, c);
        }

        return new ChassisResponse(this.body, {
            status: this.status,
            statusText: this.statusText,
            headers,
        });
    }
}
