import { ServiceProvider } from './ServiceProvider.js';
import { Container } from '../Container.js';
import { Log } from '../Log.js';

export class LoggerServiceProvider extends ServiceProvider {
    public register(app: Container): void {
        app.singleton('logger', () => new Log());

        console.log('✅ Logger registered successfully');
    }
}
