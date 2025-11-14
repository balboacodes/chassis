import type { Request, Response } from 'express';
import { route } from '../../../framework/index.ts';

export default class UserController {
    /**
     * Display a listing of the resource.
     */
    public index(req: Request, res: Response): Response {
        return res.send(route('user.index', req.params));
    }

    /**
     * Show the resource.
     */
    public show(_req: Request, res: Response): Response {
        return res.send('show');
    }
}
