import { Config, test } from '../../../index.ts';

@test()
export default class HomeController {
    public constructor(private config: Config) {
        console.log(this.config.get('app.name'));
    }

    public index(_req: any, res: any, _next: any) {
        res.send('test');
    }
}
