import HomeController from '../app/http/controllers/HomeController.js';
import { app } from '../src/framework/support/helpers.js';
import { RouteHandler } from '../src/framework/types.js';

export default (): void => {
    (app('router').get as RouteHandler)('/', HomeController, 'index');
    (app('router').get as RouteHandler)('/ping', () => app('response').send('pong'));
};
