import { ChassisRequest } from '../http/ChassisRequest.ts';
import { AsyncResponseHandler } from '../types.ts';

export abstract class Middleware {
    /**
     * Handle incomming requests.
     */
    public abstract handle(request: ChassisRequest, next: AsyncResponseHandler): Promise<Response>;
}
