import HomeController from '../app/http/controllers/HomeController.ts';
import { Route } from '../framework/index.ts';

export default function () {
    // Route.name('test').get('/test', HomeController, 'index');
    Route.name('test').get('/{test}', HomeController, 'index');
    // Route.view('/view', 'test');
}
