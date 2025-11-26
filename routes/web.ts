import { UsersController } from '../app/controllers/UsersControllers.ts';
import LogNumber from '../app/middleware/LogNumber.ts';
import { Route } from '../src/facades/Route.ts';
import { route } from '../src/helpers.ts';

export default (): void => {
    Route.get('/', () => new Response('home'));
    Route.middleware([LogNumber]).name('users.show').get('/users/:id', [UsersController, 'show']);
    Route.redirect('/redirect', route('users.show', { id: 456 }) ?? '');
    Route.get('/proxy', () => new Response('proxied'));
};
