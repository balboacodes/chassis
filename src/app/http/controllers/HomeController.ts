import type { Request, Response } from 'express';
import { Config } from '../../../framework/index.ts';

// @inject
export default class HomeController {
    // @ts-ignore
    public constructor(private config: Config) {}

    /**
     * Display a listing of the resource.
     */
    public index(req: Request, res: Response) {
        // res.send(this.config.get('app.name'));
        res.send(req.params);
    }
}
