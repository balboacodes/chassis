import { Config, inject } from '../../../framework/index.ts';

@inject
export default class HomeController {
    public constructor(private config: Config) {}

    public index(_req: any, res: any, _next: any) {
        console.log(this.config.get('app.name'));

        res.send('test');
    }
}
