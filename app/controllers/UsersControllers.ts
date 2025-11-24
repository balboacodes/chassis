import { ChassisRequest } from '../../src/ChassisRequest.ts';

export class UsersController {
    public async show(request: ChassisRequest): Promise<Response> {
        return Response.json(await request.all());
    }
}
