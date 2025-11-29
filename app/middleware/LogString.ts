import { ChassisRequest } from '../../src/http/ChassisRequest.ts';
import { Middleware } from '../../src/middleware/Middleware.ts';
import { AsyncResponseHandler } from '../../src/types.ts';

export default class LogString extends Middleware {
    /**
     * @inheritdoc
     */
    public override async handle(request: ChassisRequest, next: AsyncResponseHandler): Promise<Response> {
        console.log('test');

        return await next(request);
    }
}
