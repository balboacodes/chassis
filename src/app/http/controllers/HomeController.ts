import type { Request, Response } from 'express';
import { Config, inject } from '../../../framework/index.ts';

@inject
export default class HomeController {
    // @ts-ignore
    public constructor(private config: Config) {}

    /**
     * Display a listing of the resource.
     */
    @inject
    public index(_req: Request, res: Response, _config: Config) {
        // console.log(config);
        res.send('done');
    }
}
