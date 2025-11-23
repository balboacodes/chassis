import { ServiceProvider } from '../support/ServiceProvider.ts';
import { LogManager } from './LogManager.ts';

export class LogServiceProvider extends ServiceProvider {
    /**
     * Register the service provider.
     */
    public override register(): void {
        this.app.singleton('log', (app) => new LogManager(app));
    }
}
