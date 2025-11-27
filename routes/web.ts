import { UsersController } from '../app/controllers/UsersControllers.ts';
import { Config } from '../src/facades/Config.ts';
import { Route } from '../src/facades/Route.ts';
import { route } from '../src/helpers.ts';

export default (): void => {
    Route.get('/', () => new Response('home'));
    Route.middleware([]).resource('users', UsersController);
    Route.redirect('/redirect', route('users.show', { resource: 456 }) ?? '');
    Route.get('/facade', () => new Response(Config.get('app.name')));
};
