import { type Request, type Response } from 'express';
import Config from '../../../src/framework/Config.js';
import { inject } from '../../../src/framework/support/decorators/inject.js';

@inject([Config])
export default class HomeController {
    public constructor(private config: Config) {}

    public index(_req: Request, res: Response): void {
        res.send(this.config.get('app.name'));
    }
}
