import HomeController from '../app/http/controllers/HomeController.ts';
import { Route } from '../src/index.ts';

export default function () {
    new Route().get('/', HomeController, 'index');
}
