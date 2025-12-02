import { Arr } from '@balboacodes/laravel-helpers';
import { escape } from '@std/html/entities';
import { Cookie, setCookie } from '@std/http/cookie';
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
    public cookie(cookie: Cookie | Cookie[]): ChassisResponse {
        cookie = Arr.wrap(cookie);
        const headers = new Headers(this.headers);

        for (const c of cookie) {
            setCookie(headers, { ...c, path: '/' });
        }

        return new ChassisResponse(this.request, this.body, {
            status: this.status,
            statusText: this.statusText,
            headers,
        });
    }

    /**
     * Create a view response.
     */
    public async view(view: string, data: Record<string, unknown> = {}): Promise<Response> {
        let file = await Deno.readTextFile(join(Deno.cwd(), 'resources/views', `${view}.html`));
        for (const [key, value] of Object.entries(data)) {
            file = file.replaceAll(
                new RegExp('\\$\\{\\s*' + RegExp.escape(key) + '\\s*\\}', 'g'),
                escape(String(value)),
            );
        }

        const headers = new Headers(this.headers);
        headers.append('Content-Type', 'text/html');

        return new Response(file, { headers });
    }

    /**
     * Create a JSON response.
     */
    // @ts-ignore:
    public override json(data: unknown): Response {
        const { status, statusText, headers } = this;
        return Response.json(data, { status, statusText, headers });
    }
}
