import HomeController from '../app/http/controllers/HomeController.ts';
import { Route } from '../framework/index.ts';

export default function () {
    Route.redirect('/here', '/there');
    Route.get('/:id', HomeController, 'index');
}
