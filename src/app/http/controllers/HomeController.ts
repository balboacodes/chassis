import type { Request, Response } from 'express';
import { Config } from '../../../framework/index.ts';

export default class HomeController {
    /**
     * Display a listing of the resource.
     */
    public index(_req: Request, res: Response) {
        res.send(Config.get('app'));
    }
}
