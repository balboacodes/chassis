import { Request, Response } from 'express';
import HomeController from '../app/http/controllers/HomeController.js';
import Application from '../src/framework/Application.js';
import Route from '../src/framework/Route.js';

export default (app: Application): void => {
    new Route(app).get('/', HomeController, 'index');
    new Route(app).get('/ping', (_req: Request, res: Response) => res.send('pong'));
};
