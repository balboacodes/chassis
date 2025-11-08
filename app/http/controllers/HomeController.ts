import { config } from '../../../src/framework/helpers';

export class HomeController {
    public index(_: any, res: any): void {
        res.send(config('app.name'));
    }
}
