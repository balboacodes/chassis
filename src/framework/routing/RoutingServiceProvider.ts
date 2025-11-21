import ServiceProvider from '../support/ServiceProvider.ts';

export default class RoutingServiceProvider extends ServiceProvider {
    /**
     * Register the service provider.
     */
    public override register(): void {
        this.registerRouter();
        this.registerUrlGenerator();
        this.registerRedirector();
        this.registerPsrRequest();
        this.registerPsrResponse();
        this.registerResponseFactory();
        this.registerCallableDispatcher();
        this.registerControllerDispatcher();
    }

    /**
     * Register the router instance.
     */
    protected registerRouter(): void {
        this.app.singleton('router', (app) => new Router(app.make('events'), app));
    }

    /**
     * Register the URL generator service.
     */
    protected registerUrlGenerator(): void {
        //         this.app.singleton('url', function ($app) {
        //             $routes = $app['router']->getRoutes();

        //             // The URL generator needs the route collection that exists on the router.
        //             // Keep in mind this is an object, so we're passing by references here
        //             // and all the registered routes will be available to the generator.
        //             $app->instance('routes', $routes);

        //             return new UrlGenerator(
        //                 $routes, $app->rebinding(
        //                     'request', $this->requestRebinder()
        //                 ), $app['config']['app.asset_url']
        //             );
        //         });

        //         $this->app->extend('url', function (UrlGeneratorContract $url, $app) {
        //             // Next we will set a few service resolvers on the URL generator so it can
        //             // get the information it needs to function. This just provides some of
        //             // the convenience features to this URL generator like "signed" URLs.
        //             $url->setSessionResolver(function () {
        //                 return $this->app['session'] ?? null;
        //             });

        //             $url->setKeyResolver(function () {
        //                 $config = $this->app->make('config');

        //                 return [$config->get('app.key'), ...($config->get('app.previous_keys') ?? [])];
        //             });

        //             // If the route collection is "rebound", for example, when the routes stay
        //             // cached for the application, we will need to rebind the routes on the
        //             // URL generator instance so it has the latest version of the routes.
        //             $app->rebinding('routes', function ($app, $routes) {
        //                 $app['url']->setRoutes($routes);
        //             });

        //             return $url;
        //         });
    }

    /**
     * Get the URL generator request rebinder.
     */
    protected requestRebinder(): () => unknown {
        //         return function ($app, $request) {
        //             $app['url']->setRequest($request);
        //         };
    }

    /**
     * Register the Redirector service.
     */
    protected registerRedirector(): void {
        //         this.app.singleton('redirect', function ($app) {
        //             $redirector = new Redirector($app['url']);

        //             // If the session is set on the application instance, we'll inject it into
        //             // the redirector instance. This allows the redirect responses to allow
        //             // for the quite convenient "with" methods that flash to the session.
        //             if (isset($app['session.store'])) {
        //                 $redirector->setSession($app['session.store']);
        //             }

        //             return $redirector;
        //         });
    }

    /**
     * Register the response factory implementation.
     */
    protected registerResponseFactory(): void {
        //         this.app.singleton(ResponseFactoryContract::class, function ($app) {
        //             return new ResponseFactory($app[ViewFactoryContract::class], $app['redirect']);
        //         });
    }

    /**
     * Register the callable dispatcher.
     */
    protected registerCallableDispatcher(): void {
        //         this.app.singleton(CallableDispatcherContract::class, function ($app) {
        //             return new CallableDispatcher($app);
        //         });
    }

    /**
     * Register the controller dispatcher.
     */
    protected registerControllerDispatcher(): void {
        //         this.app.singleton(ControllerDispatcherContract::class, function ($app) {
        //             return new ControllerDispatcher($app);
        //         });
    }
}
