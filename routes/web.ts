import { Request, Response } from 'express';
import HomeController from '../app/http/controllers/HomeController.js';
import Route from '../src/framework/Route.js';

export default (): void => {
    Route.get('/', HomeController, 'index');
    Route.get('/ping', (_req: Request, res: Response) => res.send('pong'));
};
