import { Arr } from '@balboacodes/laravel-helpers';
import { Cookie, setCookie } from '@std/http/cookie';
import { serveFile } from '@std/http/file-server';
import { type Header } from '@std/http/unstable-header';
import { join } from '@std/path/join';
import { ChassisRequest } from './ChassisRequest.ts';

export class ChassisResponse extends Response {
    /**
     * Create a new Chassis response instance.
     */
    public constructor(
        /**
         * The current request instance.
         */
        protected request: ChassisRequest,
        body?: BodyInit | null,
        init?: ResponseInit,
    ) {
        super(body, init);
    }

    /**
     * Add headers to the response.
     */
    public header(header: Header | Record<Header, string>, value?: string): ChassisResponse {
        if (typeof header === 'string' && value === undefined) {
            throw new Error('Value is required');
        }

        header = (typeof header === 'string' ? { [header]: value } : header) as Record<Header, string>;
        const headers = new Headers(this.headers);

        for (const [name, value] of Object.entries(header)) {
            headers.append(name, value);
        }

        return new ChassisResponse(this.request, this.body, {
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

        return new Response(this.body, {
            status: this.status,
            statusText: this.statusText,
            headers,
        });
    }

    /**
     * Create a view response.
     */
    public async view(view: string): Promise<Response> {
        const { headers, body, status, statusText } = await serveFile(
            this.request,
            join(Deno.cwd(), 'resources/views', view),
        );
        const newHeaders = new Headers(this.headers);

        for (const [name, value] of headers) {
            newHeaders.append(name, value);
        }

        return new Response(body, { status, statusText, headers });
    }

    /**
     * Create a JSON response.
     */
    // @ts-ignore:
    public override json(data: unknown): Response {
        return Response.json(data, { status: this.status, statusText: this.statusText, headers: this.headers });
    }
}
