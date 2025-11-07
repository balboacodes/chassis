import { ServiceProvider } from './ServiceProvider.js';
import { Container } from '../Container.js';

export class LoggerServiceProvider extends ServiceProvider {
    async register(app: Container) {
        app.singleton(LoggerServiceProvider, () => ({
            log(msg: string) {
                console.log(`[INFO] ${msg}`);
            },
        }));
    }
}
