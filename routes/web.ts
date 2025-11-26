import { UsersController } from '../app/controllers/UsersControllers.ts';
import LogNumber from '../app/middleware/LogNumber.ts';
import { Config } from '../src/facades/Config.ts';
import { Route } from '../src/facades/Route.ts';
import { route } from '../src/helpers.ts';

export default (): void => {
    Route.get('/', () => new Response('home'));
    Route.middleware([LogNumber]).name('users.show').get('/users/:id', [UsersController, 'show']);
    Route.redirect('/redirect', route('users.show', { id: 456 }) ?? '');
    Route.get('/proxy', () => new Response(Config.get('app.name')));
};
