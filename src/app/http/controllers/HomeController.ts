import type { Request, Response } from 'express';
import { Config, inject } from '../../../framework/index.ts';

@inject
export default class HomeController {
    public constructor(private config: Config) {}

    public index(_req: Request, res: Response) {
        console.log(this.config.get('app.name'));

        res.send('test');
    }
}
