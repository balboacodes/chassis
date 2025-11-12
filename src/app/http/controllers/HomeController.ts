import type { Request, Response } from 'express';
import { Config, inject } from '../../../framework/index.ts';

@inject
export default class HomeController {
    // @ts-ignore
    public constructor(private config: Config) {}

    public index(req: Request, res: Response) {
        // res.send(this.config.get('app.name'));
        res.send(req.params);
    }
}
