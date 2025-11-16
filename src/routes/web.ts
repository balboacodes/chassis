import HomeController from '../app/http/controllers/HomeController.ts';
import UserController from '../app/http/controllers/UserController.ts';
import LogTime from '../app/http/middleware/LogTime.ts';
import { Route } from '../framework/index.ts';

export default () => {
    Route.get('/', (_req, res) => res.route('home.index'));
    // Route.get('/', (_req, res) => res.view('test'));

    Route.view('/view', 'test');

    Route.middleware(LogTime).group(() => {
        Route.get('/group1', (_req, res) => res.send('group1'));
        Route.get('/group2', (_req, res) => res.send('group2'));
        Route.get('/group3', (_req, res) => res.send('group3'));
    });

    Route.prefix('home')
        .name('home.')
        .controller(HomeController)
        .group(() => {
            Route.name('index').get('', 'index');
            Route.name('foo').get('/test/{foo?}', 'show');
        });

    Route.only(['index', 'show']).resource('users', UserController);
    Route.get('/{one}/{two}/{three}', (req, res) => res.send(req.string('test', 'default')));
};
