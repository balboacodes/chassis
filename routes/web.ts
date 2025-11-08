import HomeController from '../app/http/controllers/HomeController.js';
import Application from '../src/framework/Application.js';
import { Route } from '../src/framework/types.js';

export default function (app: Application): void {
    (app.router.get as Route)('/', HomeController, 'index');
    app.router.get('/ping', (_, res) => res.send('pong'));
}
