import { UsersController } from '../app/controllers/UsersControllers.ts';
import { Config } from '../src/facades/Config.ts';
import { Route } from '../src/facades/Route.ts';
import { route } from '../src/helpers.ts';

export default (): void => {
    Route.get('/', () => new Response('home'));
    Route.middleware([]).prefix('users').name('users.').group(() => {
        Route.middleware([]).name('test').get('/test', () => new Response('users test'));
        Route.name('show').get('/:id', [UsersController, 'show']);
    });
    Route.redirect('/redirect', route('users.show', { id: 456 }) ?? '');
    Route.get('/proxy', () => new Response(Config.get('app.name')));
};
