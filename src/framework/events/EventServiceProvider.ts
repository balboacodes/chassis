import { Factory as QueueFactoryContract } from '../contracts/queue/Factory.ts';
import ServiceProvider from '../support/ServiceProvider.ts';
import Dispatcher from './Dispatcher.ts';

export default class EventServiceProvider extends ServiceProvider {
    /**
     * Register the service provider.
     */
    public override register(): void {
        this.app.singleton(
            'events',
            (app) =>
                (new Dispatcher(app)).setQueueResolver(() => app.make(QueueFactoryContract))
                    .setTransactionManagerResolver(() =>
                        app.bound('db.transactions') ? app.make('db.transactions') : null
                    ),
        );
    }
}
