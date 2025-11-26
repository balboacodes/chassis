import { ChassisRequest } from '../ChassisRequest.ts';

export abstract class Middleware {
    /**
     * Handle incomming requests.
     */
    public abstract handle(
        request: ChassisRequest,
        next: (request: ChassisRequest) => Promise<Response>,
    ): Promise<Response>;
}
