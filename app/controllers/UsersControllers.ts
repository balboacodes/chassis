import { ChassisRequest } from '../../src/http/ChassisRequest.ts';
import { ChassisResponse } from '../../src/http/ChassisResponse.ts';

export class UsersController {
    public index(request: ChassisRequest): Promise<Response> {
        return new ChassisResponse(request).view('users/index.html');
    }

    public show(request: ChassisRequest): Response {
        return new ChassisResponse(request).json({ test: 123333 });
    }
}
