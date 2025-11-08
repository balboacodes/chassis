import Container from '../Container.js';
import Log from '../Log.js';
import ServiceProvider from './ServiceProvider.js';

export default class LoggerServiceProvider extends ServiceProvider {
    public register(app: Container): void {
        app.singleton(Log, () => new Log());
    }
}
