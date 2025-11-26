import { ChassisRequest } from '../../src/ChassisRequest.ts';
import { Middleware } from '../../src/middleware/Middleware.ts';
import { MiddlewareNextHandler } from '../../src/types.ts';

export default class LogNumber extends Middleware {
    /**
     * @inheritdoc
     */
    public override async handle(
        request: ChassisRequest,
        next: MiddlewareNextHandler,
    ): Promise<Response> {
        console.log(123);

        return await next(request);
    }
}
