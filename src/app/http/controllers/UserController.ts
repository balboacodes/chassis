import type { Response } from 'express';
import { Request, route } from '../../../framework/index.ts';

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
        return res.send(req.request.params);
    }

    public edit(_req: Request, _res: Response) {}

    public update(_req: Request, _res: Response) {}

    public destroy(_req: Request, _res: Response) {}
}
