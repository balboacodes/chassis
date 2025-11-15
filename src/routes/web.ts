import { Route } from '../framework/index.ts';

export default function () {
    // Route.get('/callback', (_req, res) => res.send('callback'));

    // Route.view('/view', 'test');

    // Route.middleware(LogTime).group(() => {
    //     Route.get('/group1', (_req, res) => res.send('group1'));
    //     Route.get('/group2', (_req, res) => res.send('group2'));
    //     Route.get('/group3', (_req, res) => res.send('group3'));
    // });

    // Route.prefix('home')
    //     .name('home.')
    //     .controller(HomeController)
    //     .group(() => {
    //         Route.name('index').get('', 'index');
    //         Route.name('foo').get('/test/{foo?}', 'show');
    //     });

    // Route.only(['index', 'show']).resource('users', UserController);
    Route.get('/{one}/{two}/{three}', (req, res) => res.send(req.string('test', 'default')));
}
