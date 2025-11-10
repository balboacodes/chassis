import { Request, Response } from 'express';
import HomeController from '../app/http/controllers/HomeController.js';
import LogTime from '../app/http/middleware/LogTime.js';
import Route from '../src/framework/Route.js';
import { config } from '../src/framework/support/helpers.js';

export default (): void => {
    new Route().get('/:id/:name', HomeController, 'index');
    new Route().get('/ping', (_req: Request, res: Response) => res.send(config('app.name')));
    new Route().middleware(LogTime).get('/test', (_req: Request, res: Response) => res.send(config('app.url')));
};
