import { Config } from '../../src/facades/Config.ts';
import { ChassisRequest } from '../../src/http/ChassisRequest.ts';
import { ChassisResponse } from '../../src/http/ChassisResponse.ts';

export class UsersController {
    public index(request: ChassisRequest): Promise<Response> {
        return new ChassisResponse(request).view('users/index', { user: 'testing', name: Config.get('app.name') });
    }

    public show(request: ChassisRequest): Response {
        return new ChassisResponse(request).json({ test: 555 });
    }
}
