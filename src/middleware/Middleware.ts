import { ChassisRequest } from '../ChassisRequest.ts';
import { MiddlewareNextHandler } from '../types.ts';

export abstract class Middleware {
    /**
     * Handle incomming requests.
     */
    public abstract handle(
        request: ChassisRequest,
        next: MiddlewareNextHandler,
    ): Promise<Response>;
}
