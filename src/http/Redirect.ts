import { getCookies, setCookie } from '@std/http/cookie';
import { parseSignedCookie, signCookie, verifySignedCookie } from '@std/http/unstable-signed-cookie';
import { Config } from '../facades/Config.ts';
import { parseAppKey, route } from '../helpers.ts';
import { ChassisRequest } from './ChassisRequest.ts';

export class Redirect {
    /**
     * The flash data headers for the redirect.
     */
    protected flashHeaders: Headers = new Headers();

    /**
     * Create a new redirect instance.
     */
    public constructor(
        /**
         * The current request.
         */
        protected request: ChassisRequest,
    ) {}

    /**
     * Redirect to a given path.
     */
    public to(path: string): Response {
        const url = Config.get('app.url');
        const port = Config.get('app.port');
        const redirect = Response.redirect(new URL(path, `${url}:${port}`));
        const headers = new Headers(redirect.headers);

        for (const [key, value] of this.flashHeaders.entries()) {
            headers.append(key, value);
        }

        return new Response(redirect.body, {
            status: redirect.status,
            statusText: redirect.statusText,
            headers,
        });
    }

    /**
     * Redirect back to the previous URL.
     */
    public async back(): Promise<Response> {
        const key = await parseAppKey();
        const previousUrl = getCookies(this.request.headers)['previous-url'];

        if (previousUrl === undefined) throw new Error('Previous URL not set');
        if (!await verifySignedCookie(previousUrl, key)) throw new Error('Previous URL could not be verified');

        const redirect = Response.redirect(parseSignedCookie(previousUrl));
        const headers = new Headers(redirect.headers);

        for (const [key, value] of this.flashHeaders.entries()) {
            headers.append(key, value);
        }

        return new Response(redirect.body, {
            status: redirect.status,
            statusText: redirect.statusText,
            headers,
        });
    }

    /**
     * Redirect to the named route.
     */
    public route(name: string, parameters?: Record<string, number | string>): Response {
        return this.to(route(name, parameters));
    }

    /**
     * Flash the given data to the session before redirecting.
     */
    public async with(key: string | Record<string, string>, value?: string): Promise<this> {
        if (typeof key === 'string' && value === undefined) {
            throw new Error('Value is required');
        }

        const appKey = await parseAppKey();
        key = (typeof key === 'string' ? { [key]: value } : key) as Record<string, string>;

        for (const [k, v] of Object.entries(key)) {
            const flashData = await signCookie(v, appKey);
            setCookie(this.flashHeaders, { name: `flash.${k}`, value: flashData });
        }

        return this;
    }
}
