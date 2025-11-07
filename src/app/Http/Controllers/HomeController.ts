import { LoggerServiceProvider } from '../../providers/LoggerServiceProvider';

@Reflect.metadata('design:paramtypes', [LoggerServiceProvider])
export class HomeController {
    constructor(private logger: LoggerServiceProvider) {}

    index(req: any, res: any) {
        this.logger.log('Hello world from HomeController!');
        res.send('Welcome!');
    }
}
