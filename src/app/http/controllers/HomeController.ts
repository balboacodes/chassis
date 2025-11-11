import type { Request, Response } from 'express';

export default class HomeController {
    public constructor() {}

    public index(_req: Request, res: Response) {
        res.send('test');
    }
}
