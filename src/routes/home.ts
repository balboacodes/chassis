import { HomeController } from '../app/http/controllers/HomeController.js';
import { Application } from '../framework/Application.js';
import { Route } from '../framework/providers/RouteServiceProvider.js';

export default function (app: Application): void {
    (app.app.get as Route)('/', HomeController, 'index');
    app.app.get('/ping', (_, res) => res.send('pong'));
}
