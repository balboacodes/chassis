import type { Request, Response } from 'express';
import HomeController from '../app/http/controllers/HomeController.ts';
import { Route } from '../framework/index.ts';

export default function () {
    Route.get('/callback', (_req: Request, res: Response): Response => res.send('callback'));
    Route.view('/view', 'test');
    Route.name('home.index').get('/{foo}/{bar?}/{baz?}', HomeController, 'index');
}
