import JobProcessing from '../../queue/events/JobProcessing.ts';
import Queue from '../../queue/Queue.ts';
import Context from '../../support/facades/Context.ts';
import ServiceProvider from '../../support/ServiceProvider.ts';
import ContextLogProcessor from './ContextLogProcessor.ts';

export default class ContextServiceProvider extends ServiceProvider {
    /**
     * Register the service provider.
     */
    public override register(): void {
        this.app.bind(ContextLogProcessor, () => new ContextLogProcessor());
    }

    /**
     * Boot the application services.
     */
    public override boot(): void {
        Queue.createPayloadUsing((connection, queue, payload) => {
            const context = Context.dehydrate();

            return context === null ? payload : {
                ...payload,
                'illuminate:log:context': context,
            };
        });

        this.app.make('events').listen((event: JobProcessing) => {
            Context.hydrate(event.job.payload()['illuminate:log:context'] ?? null);
        });
    }
}
