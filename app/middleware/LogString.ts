import { ChassisRequest } from '../../src/ChassisRequest.ts';
import { Middleware } from '../../src/middleware/Middleware.ts';
import { MiddlewareNextHandler } from '../../src/types.ts';

export default class LogString extends Middleware {
    /**
     * @inheritdoc
     */
    public override async handle(
        request: ChassisRequest,
        next: MiddlewareNextHandler,
    ): Promise<Response> {
        console.log('test');

        return await next(request);
    }
}
