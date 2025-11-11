import HomeController from '../app/http/controllers/HomeController.ts';
import { Route } from '../index.ts';

export default function () {
    new Route().get('/', HomeController, 'index');
}
