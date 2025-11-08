import { Request, Response } from 'express';

export default class HomeController {
    public index(_: Request, res: Response): void {
        res.send('hello');
    }
}
