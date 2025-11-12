import type { Request, Response } from 'express';
import { route } from '../../../framework/index.ts';

export default class HomeController {
    /**
     * Display a listing of the resource.
     */
    public index(_req: Request, res: Response) {
        res.send(route('test', { id: 'sdsd' }));
    }
}
