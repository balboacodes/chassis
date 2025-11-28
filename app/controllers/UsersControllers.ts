import { ChassisRequest } from '../../src/http/ChassisRequest.ts';

export class UsersController {
    public index(): Response {
        return new Response(
            `
            <!doctype html>
            <html>
                <head>
                <title>Users</title>
                </head>
                <body>
                  <h1>Users</h1>
                  <a href="/back">Back</a>
                </body>
            </html>
        `,
            {
                headers: { 'Content-Type': 'html' },
            },
        );
    }

    public async show(request: ChassisRequest): Promise<Response> {
        return Response.json(await request.all());
    }
}
