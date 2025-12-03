import { setCookie } from '@std/http/cookie';
import { ChassisRequest } from '../../http/ChassisRequest.ts';
import { Middleware } from '../../middleware/Middleware.ts';
import { AsyncResponseHandler } from '../../types.ts';
import { CookieJar } from '../CookieJar.ts';

export class AddQueuedCookiesToResponse extends Middleware {
    /**
     * Create a new CookieQueue instance.
     */
    public constructor(
        /**
         * The cookie jar instance.
         */
        protected cookies: CookieJar,
    ) {
        super();
    }

    /**
     * Handle an incoming request.
     */
    public async handle(request: ChassisRequest, next: AsyncResponseHandler): Promise<Response> {
        const response = await next(request);
        const headers = new Headers(response.headers);

        for (const cookie of Object.values(this.cookies.getQueuedCookies())) {
            setCookie(headers, {
                name: cookie.getName(),
                value: cookie.getValue()!,
                expires: cookie.getExpiresTime(),
                maxAge: cookie.getMaxAge(),
                domain: cookie.getDomain(),
                path: cookie.getPath(),
                secure: cookie.isSecure(),
                httpOnly: cookie.isHttpOnly(),
                partitioned: cookie.isPartitioned(),
                sameSite: cookie.getSameSite() as 'Strict' | 'Lax' | 'None' | undefined,
            });
        }

        // Must return a copy of the response with updated headers because the headers are immutable once a response
        // has been created within the app
        return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }
}
