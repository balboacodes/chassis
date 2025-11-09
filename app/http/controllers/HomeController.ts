import { app } from '../../../src/framework/support/helpers.js';

export default class HomeController {
    public index(): void {
        app('response').send('hello');
    }
}
