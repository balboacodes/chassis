import { deleteCookie, getCookies, getSetCookies, setCookie } from '@std/http/cookie';
import { ChassisRequest } from '../http/ChassisRequest.ts';
import { AsyncResponseHandler } from '../types.ts';
import { Middleware } from './Middleware.ts';

export class ManageFlashData extends Middleware {
    /**
     * Handle incomming requests.
     */
    public async handle(request: ChassisRequest, next: AsyncResponseHandler): Promise<Response> {
        const response = await next(request);
        const headers = new Headers(response.headers);
        const cookies = getCookies(request.headers);

        // Delete / mark stale entries for deletion
        for (const [key, value] of Object.entries(cookies)) {
            if (key.startsWith('stale.flash.')) {
                if (Number.parseInt(value)) {
                    deleteCookie(headers, key.substring(6));
                    deleteCookie(headers, key, { path: '/' });
                } else {
                    setCookie(headers, { name: key, path: '/', value: '1' });
                }
            }
        }

        // Add stale entry to set cookies entries
        for (const cookie of Object.values(getSetCookies(headers))) {
            if (cookie.name.startsWith('flash.') && cookie.value) {
                setCookie(headers, { name: `stale.${cookie.name}`, path: '/', value: '0' });
            }
        }

        // Must return a copy of the response with updated headers because the headers are immutable once a response
        // has been created within the app
        return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }
}
