import ServiceProvider from '../../support/ServiceProvider.ts';

export default class ContextServiceProvider extends ServiceProvider {
    //     /**
    //      * Register the service provider.
    //      *
    //      * @return void
    //      */
    //     public function register()
    //     {
    //         $this->app->scoped(Repository::class);

    //         $this->app->bind(ContextLogProcessorContract::class, fn () => new ContextLogProcessor());
    //     }

    //     /**
    //      * Boot the application services.
    //      *
    //      * @return void
    //      */
    //     public function boot()
    //     {
    //         Queue::createPayloadUsing(function ($connection, $queue, $payload) {
    //             /** @phpstan-ignore staticMethod.notFound */
    //             $context = Context::dehydrate();

    //             return $context === null ? $payload : [
    //                 ...$payload,
    //                 'illuminate:log:context' => $context,
    //             ];
    //         });

    //         $this->app['events']->listen(function (JobProcessing $event) {
    //             /** @phpstan-ignore staticMethod.notFound */
    //             Context::hydrate($event->job->payload()['illuminate:log:context'] ?? null);
    //         });
    //     }
}
