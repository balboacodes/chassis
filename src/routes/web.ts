import HomeController from '../app/http/controllers/HomeController.ts';
import { Route } from '../framework/index.ts';

export default function () {
    new Route().get('/', HomeController, 'index');
    new Route().redirect('/here', '/there');
}
