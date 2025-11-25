import { UsersController } from '../app/controllers/UsersControllers.ts';
import { Route } from '../src/routing/Route.ts';

export default (): void => {
    new Route().get('/', () => new Response('here'));
    new Route().get('/users/:id?', [UsersController, 'show']);
    new Route().redirect('/redirect', '/');
};
