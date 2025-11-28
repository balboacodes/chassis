import { setCookie } from '@std/http/cookie';
import { signCookie } from '@std/http/unstable-signed-cookie';
import { parseAppKey } from '../helpers.ts';
import { ChassisRequest } from '../http/ChassisRequest.ts';
import { RouteStackHandler } from '../types.ts';
import { Middleware } from './Middleware.ts';

export class SetPreviousUrl extends Middleware {
    /**
     * Handle incomming requests.
     */
    public async handle(request: ChassisRequest, next: RouteStackHandler): Promise<Response> {
        const response = await next(request);

        const headers = new Headers(response.headers);
        const key = await parseAppKey();
        const value = await signCookie(request.url, key);
        setCookie(headers, { name: 'previous-url', value });

        // Must return a copy of the response with updated headers because once a response has been created within the
        // app, the headers are immutable
        return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }
}
