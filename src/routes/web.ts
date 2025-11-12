import HomeController from '../app/http/controllers/HomeController.ts';
import { Route } from '../framework/index.ts';

export default function () {
    Route.name('test').get('/:id', HomeController, 'index');
    // Route.redirect('/here', '/there');
}
