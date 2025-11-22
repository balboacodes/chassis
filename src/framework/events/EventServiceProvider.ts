import { ServiceProvider } from '../support/ServiceProvider.ts';

export class EventServiceProvider extends ServiceProvider {
    //     /**
    //      * Register the service provider.
    //      *
    //      * @return void
    //      */
    //     public function register()
    //     {
    //         $this->app->singleton('events', function ($app) {
    //             return (new Dispatcher($app))->setQueueResolver(function () use ($app) {
    //                 return $app->make(QueueFactoryContract::class);
    //             })->setTransactionManagerResolver(function () use ($app) {
    //                 return $app->bound('db.transactions')
    //                     ? $app->make('db.transactions')
    //                     : null;
    //             });
    //         });
    //     }
}
