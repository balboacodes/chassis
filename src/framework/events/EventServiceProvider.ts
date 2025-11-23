import { ServiceProvider } from '../support/ServiceProvider.ts';
import { Dispatcher } from './Dispatcher.ts';

export class EventServiceProvider extends ServiceProvider {
    /**
     * Register the service provider.
     */
    public override register(): void {
        this.app.singleton(
            'events',
            (app) =>
                (new Dispatcher(app)).setTransactionManagerResolver(() =>
                    app.bound('db.transactions') ? app.make('db.transactions') : undefined
                ),
        );
    }
}
