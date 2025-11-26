import { ChassisRequest } from '../ChassisRequest.ts';
import { RouteStackHandler } from '../types.ts';

export abstract class Middleware {
    /**
     * Handle incomming requests.
     */
    public abstract handle(
        request: ChassisRequest,
        next: RouteStackHandler,
    ): Promise<Response>;
}
