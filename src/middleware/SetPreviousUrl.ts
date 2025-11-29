import { getCookies, setCookie } from '@std/http/cookie';
import { parseSignedCookie, signCookie, verifySignedCookie } from '@std/http/unstable-signed-cookie';
import { parseAppKey } from '../helpers.ts';
import { ChassisRequest } from '../http/ChassisRequest.ts';
import { AsyncResponseHandler } from '../types.ts';
import { Middleware } from './Middleware.ts';

export class SetPreviousUrl extends Middleware {
    /**
     * Handle incomming requests.
     */
    public async handle(request: ChassisRequest, next: AsyncResponseHandler): Promise<Response> {
        const response = await next(request);
        const headers = new Headers(response.headers);

        const key = await parseAppKey();
        let previousUrl = getCookies(request.headers)['previous-url'];

        if (previousUrl && !await verifySignedCookie(previousUrl, key)) {
            throw new Error('Previous URL could not be verified');
        }

        previousUrl = parseSignedCookie(previousUrl ?? '/');
        const value = await signCookie(previousUrl, key);

        setCookie(headers, { name: 'previous-url', value });

        // Must return a copy of the response with updated headers because the headers are immutable once a response
        // has been created within the app
        return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }
}
