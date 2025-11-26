import { ChassisRequest } from '../../src/ChassisRequest.ts';
import { Middleware } from '../../src/middleware/Middleware.ts';

export default class LogString extends Middleware {
    /**
     * @inheritdoc
     */
    public override async handle(
        request: ChassisRequest,
        next: (request: ChassisRequest) => Promise<Response>,
    ): Promise<Response> {
        console.log('test');

        return await next(request);
    }
}
