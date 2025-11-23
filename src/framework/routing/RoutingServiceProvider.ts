import { isset } from '@balboacodes/php-utils';
import { Repository } from '../config/Repository.ts';
import { Container } from '../container/Container.ts';
import { Dispatcher } from '../events/Dispatcher.ts';
import { Request } from '../http/Request.ts';
import { Store } from '../session/Store.ts';
import { ServiceProvider } from '../support/ServiceProvider.ts';
import { Factory } from '../view/Factory.ts';
import { CallableDispatcher } from './CallableDispatcher.ts';
import { ControllerDispatcher } from './ControllerDispatcher.ts';
import { Redirector } from './Redirector.ts';
import { ResponseFactory } from './ResponseFactory.ts';
import { Router } from './Router.ts';
import { UrlGenerator } from './UrlGenerator.ts';

export class RoutingServiceProvider extends ServiceProvider {
    /**
     * Register the service provider.
     */
    public override register(): void {
        this.registerRouter();
        this.registerUrlGenerator();
        this.registerRedirector();
        this.registerResponseFactory();
        this.registerCallableDispatcher();
        this.registerControllerDispatcher();
    }

    /**
     * Register the router instance.
     */
    protected registerRouter(): void {
        this.app.singleton('router', (app) => new Router(app.make('events') as Dispatcher, app));
    }

    /**
     * Register the URL generator service.
     */
    protected registerUrlGenerator(): void {
        this.app.singleton('url', (app) => {
            const routes = (app.make('router') as Router).getRoutes();

            // The URL generator needs the route collection that exists on the router.
            // Keep in mind this is an object, so we're passing by references here
            // and all the registered routes will be available to the generator.
            app.instance('routes', routes);

            return new UrlGenerator(
                routes,
                app.rebinding('request', this.requestRebinder()) as Request,
                (app.make('config') as Repository).get('app.asset_url') as string | undefined,
            );
        });
    }

    /**
     * Get the URL generator request rebinder.
     */
    protected requestRebinder(): (container: Container, instance: object) => unknown {
        return (app, request) => {
            (app.make('url') as UrlGenerator).setRequest(request);
        };
    }

    /**
     * Register the Redirector service.
     */
    protected registerRedirector(): void {
        this.app.singleton('redirect', (app) => {
            const redirector = new Redirector(app.make('url') as UrlGenerator);

            // If the session is set on the application instance, we'll inject it into
            // the redirector instance. This allows the redirect responses to allow
            // for the quite convenient "with" methods that flash to the session.
            if (isset(app.make('session.store'))) {
                redirector.setSession(app.make('session.store') as Store);
            }

            return redirector;
        });
    }

    /**
     * Register the response factory implementation.
     */
    protected registerResponseFactory(): void {
        this.app.singleton(
            ResponseFactory,
            (app) => new ResponseFactory(app.make(Factory) as Factory, app.make('redirect') as Redirector),
        );
    }

    /**
     * Register the callable dispatcher.
     */
    protected registerCallableDispatcher(): void {
        this.app.singleton(CallableDispatcher, (app) => new CallableDispatcher(app));
    }

    /**
     * Register the controller dispatcher.
     */
    protected registerControllerDispatcher(): void {
        this.app.singleton(ControllerDispatcher, (app) => new ControllerDispatcher(app));
    }
}
