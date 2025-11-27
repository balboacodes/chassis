import { ChassisRequest } from '../../src/ChassisRequest.ts';

export class UsersController {
    public index(_request: ChassisRequest): Response {
        return new Response('index');
    }

    public async show(request: ChassisRequest): Promise<Response> {
        return Response.json(await request.all());
    }
}
