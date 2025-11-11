import { Config, test } from '../../../src/index.ts';

@test
export default class HomeController {
    public constructor(private config: Config) {}

    public index(req:any, res:any, next:any) {
        // console.log(this.config);
        res.send('test');
    }
}
