import { UsersController } from '../app/controllers/UsersControllers.ts';
import { Route } from '../src/facades/Route.ts';
import { ChassisResponse } from '../src/http/ChassisResponse.ts';
import { Redirect } from '../src/http/Redirect.ts';

export default (): void => {
    Route.name('home').get('/', (request) => new ChassisResponse(request).view('home'));
    Route.middleware([]).resource('users', UsersController);
    Route.redirect('/redirect', '/');
    Route.get('/back', (request) => new Redirect(request).back());
    Route.get('/with', (request) => new Redirect(request).with('test', 'testing-flash').to('/'));
};
