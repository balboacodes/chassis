import type { Request, Response } from 'express';
import HomeController from '../app/http/controllers/HomeController.ts';
import UserController from '../app/http/controllers/UserController.ts';
import LogTime from '../app/http/middleware/LogTime.ts';
import { Route } from '../framework/index.ts';

export default function () {
    Route.get('/callback', (_req: Request, res: Response): Response => res.send('callback'));
    Route.view('/view', 'test');
    Route.middleware(LogTime).group(() => {
        Route.get('/group1', (_req: Request, res: Response): Response => res.send('group1'));
        Route.get('/group2', (_req: Request, res: Response): Response => res.send('group2'));
        Route.get('/group3', (_req: Request, res: Response): Response => res.send('group3'));
    });
    Route.prefix('home')
        .name('home.')
        .controller(HomeController)
        .group(() => {
            Route.name('index').get('', 'index');
            Route.name('foo').get('/{foo?}', 'foo');
        });

    Route.resource('users', UserController);
}
