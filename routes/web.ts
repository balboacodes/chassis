import { UsersController } from '../app/controllers/UsersControllers.ts';
import { route } from '../src/helpers.ts';
import { Route } from '../src/routing/Route.ts';

export default (): void => {
    new Route().get('/', () => new Response('here'));
    new Route().name('users.show').get('/users/:id', [UsersController, 'show']);
    new Route().redirect('/redirect', route('users.show', { id: 123 }) ?? '');
};
