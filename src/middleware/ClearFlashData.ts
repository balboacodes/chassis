import { ChassisRequest } from '../http/ChassisRequest.ts';
import { AsyncResponseHandler } from '../types.ts';
import { Middleware } from './Middleware.ts';

export class ClearFlashData extends Middleware {
    /**
     * Handle incomming requests.
     */
    public async handle(request: ChassisRequest, next: AsyncResponseHandler): Promise<Response> {
        const response = await next(request);
        const headers = new Headers(response.headers);
        // const setCookies = getSetCookies(headers);

        // for (const key of Object.keys(getCookies(request.headers))) {
        // const setCookie = setCookies.find((cookie) => cookie.name === key);

        // if (!setCookie && key.startsWith('flash.')) {
        // deleteCookie(headers, key);
        // }
        // }

        // Must return a copy of the response with updated headers because the headers are immutable once a response
        // has been created within the app
        return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }
}
