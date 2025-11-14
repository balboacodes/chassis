import type { Request, Response } from 'express';
import { route } from '../../../framework/index.ts';

export default class UserController {
    /**
     * Display a listing of the resource.
     */
    public index(_req: Request, res: Response): Response {
        return res.send(route('users.index'));
    }

    public create(_req: Request, _res: Response) {}

    public store(_req: Request, _res: Response) {}

    /**
     * Show the resource.
     */
    public show(req: Request, res: Response): Response {
        return res.send(req.params);
    }

    public edit(_req: Request, _res: Response) {}

    public update(_req: Request, _res: Response) {}

    public destroy(_req: Request, _res: Response) {}
}
