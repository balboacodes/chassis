import { setCookie } from '@std/http/cookie';
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

        if (request.method === 'GET') {
            setCookie(headers, { name: 'previous-url', value: request.url });
        }

        // Must return a copy of the response with updated headers because the headers are immutable once a response
        // has been created within the app
        return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }
}
