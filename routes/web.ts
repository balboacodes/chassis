import { UsersController } from '../app/controllers/UsersControllers.ts';
import { Config } from '../src/facades/Config.ts';
import { Route } from '../src/facades/Route.ts';
import { Redirect } from '../src/http/Redirect.ts';

export default (): void => {
    Route.name('home').get('/', () => new Response('home'));
    Route.middleware([]).resource('users', UsersController);
    Route.redirect('/redirect', '/');
    Route.get('/facade', () => new Response(Config.get('app.name')));
    Route.get('/back', (request) => new Redirect(request).back());
};
