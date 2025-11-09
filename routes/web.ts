import { Express } from 'express';
import HomeController from '../app/http/controllers/HomeController.js';
import { RouteHandler } from '../src/framework/types.js';

export default (route: Express): void => {
    (route.get as RouteHandler)('/', HomeController, 'index');
    route.get('/ping/:id/:name', (_, res) => res.send('pong'));
};
