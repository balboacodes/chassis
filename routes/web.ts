import { UsersController } from '../app/controllers/UsersControllers.ts';
import { Route } from '../src/Route.ts';

export default function (): void {
    Route.get('/', () => new Response('here'));
    Route.get('/users/:id', [UsersController, 'show']);
}
