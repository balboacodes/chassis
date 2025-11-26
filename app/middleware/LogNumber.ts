import { ChassisRequest } from '../../src/ChassisRequest.ts';
import { Middleware } from '../../src/middleware/Middleware.ts';
import { RouteStackHandler } from '../../src/types.ts';

export default class LogNumber extends Middleware {
    /**
     * @inheritdoc
     */
    public override async handle(
        request: ChassisRequest,
        next: RouteStackHandler,
    ): Promise<Response> {
        console.log(123);

        return await next(request);
    }
}
