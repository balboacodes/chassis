import ServiceProvider from './ServiceProvider.js';
import Container from '../Container.js';
import Log from '../Log.js';

export default class LoggerServiceProvider extends ServiceProvider {
    public register(app: Container): void {
        app.singleton(Log, () => new Log());

        console.log(app.bound(Log) ? '✅ Logger registered' : '❗️ Logger not registered');
    }
}
