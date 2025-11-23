import { existsSync } from '@std/fs';
import { Collection } from '../../support/Collection.ts';
import { isClass } from '../../support/helpers.ts';
import { Class } from '../../types.ts';
import { Application } from '../Application.ts';
import { RegisterProviders } from '../bootstrap/RegisterProviders.ts';
import { Kernel as ConsoleKernel } from '../console/Kernel.ts';
import { Kernel as HttpKernel } from '../http/Kernel.ts';
import { EventServiceProvider } from '../support/providers/EventServiceProvider.ts';

export class ApplicationBuilder {
    /**
     * The service providers that are marked for registration.
     */
    protected pendingProviders: Map<Class, boolean> = new Map();

    //     /**
    //      * Any additional routing callbacks that should be invoked while registering routes.
    //      *
    //      * @var array
    //      */
    //     protected array additionalRoutingCallbacks = [];

    //     /**
    //      * The Folio / page middleware that have been defined by the user.
    //      *
    //      * @var array
    //      */
    //     protected array pageMiddleware = [];

    /**
     * Create a new application builder instance.
     */
    public constructor(protected app: Application) {}

    /**
     * Register the standard kernel classes for the application.
     */
    public withKernels(): this {
        this.app.singleton(HttpKernel, HttpKernel);

        this.app.singleton(ConsoleKernel, ConsoleKernel);

        return this;
    }

    /**
     * Register additional service providers.
     */
    public withProviders(providers: unknown[] = [], withBootstrapProviders: boolean = true): this {
        RegisterProviders.merge(providers, withBootstrapProviders ? this.app.getBootstrapProvidersPath() : undefined);

        return this;
    }

    /**
     * Register the core event service provider for the application.
     */
    public withEvents(discover: string[] | boolean = true): this {
        if (Array.isArray(discover)) {
            EventServiceProvider.setEventDiscoveryPaths(discover);
        }

        if (discover === false) {
            EventServiceProvider.disableEventDiscovery();
        }

        if (!this.pendingProviders.has(EventServiceProvider)) {
            this.app.booting(() => {
                this.app.register(EventServiceProvider);
            });
        }

        this.pendingProviders.set(EventServiceProvider, true);

        return this;
    }

    //     /**
    //      * Register the broadcasting services for the application.
    //      *
    //      * @param  string  channels
    //      * @param  array  attributes
    //      * @return this
    //      */
    //     public withBroadcasting(string channels, array attributes = [])
    //     {
    //         this.app.booted(function () use (channels, attributes) {
    //             Broadcast::routes(! empty(attributes) ? attributes : null);

    //             if (file_exists(channels)) {
    //                 require channels;
    //             }
    //         });

    //         return this;
    //     }

    //     /**
    //      * Register the routing services for the application.
    //      *
    //      * @param  \Closure|null  using
    //      * @param  array|string|null  web
    //      * @param  array|string|null  api
    //      * @param  string|null  commands
    //      * @param  string|null  channels
    //      * @param  string|null  pages
    //      * @param  string  apiPrefix
    //      * @param  callable|null  then
    //      * @return this
    //      */
    //     public withRouting(?Closure using = null,
    //         array|string|null web = null,
    //         array|string|null api = null,
    //         ?string commands = null,
    //         ?string channels = null,
    //         ?string pages = null,
    //         ?string health = null,
    //         string apiPrefix = 'api',
    //         ?callable then = null)
    //     {
    //         if (is_null(using) && (is_string(web) || is_array(web) || is_string(api) || is_array(api) || is_string(pages) || is_string(health)) || is_callable(then)) {
    //             using = this.buildRoutingCallback(web, api, pages, health, apiPrefix, then);

    //             if (is_string(health)) {
    //                 PreventRequestsDuringMaintenance::except(health);
    //             }
    //         }

    //         AppRouteServiceProvider::loadRoutesUsing(using);

    //         this.app.booting(function () {
    //             this.app.register(AppRouteServiceProvider::class, force: true);
    //         });

    //         if (is_string(commands) && realpath(commands) !== false) {
    //             this.withCommands([commands]);
    //         }

    //         if (is_string(channels) && realpath(channels) !== false) {
    //             this.withBroadcasting(channels);
    //         }

    //         return this;
    //     }

    //     /**
    //      * Create the routing callback for the application.
    //      *
    //      * @param  array|string|null  web
    //      * @param  array|string|null  api
    //      * @param  string|null  pages
    //      * @param  string|null  health
    //      * @param  string  apiPrefix
    //      * @param  callable|null  then
    //      * @return \Closure
    //      */
    //     protected function buildRoutingCallback(array|string|null web,
    //         array|string|null api,
    //         ?string pages,
    //         ?string health,
    //         string apiPrefix,
    //         ?callable then)
    //     {
    //         return function () use (web, api, pages, health, apiPrefix, then) {
    //             if (is_string(api) || is_array(api)) {
    //                 if (is_array(api)) {
    //                     foreach (api as apiRoute) {
    //                         if (realpath(apiRoute) !== false) {
    //                             Route::middleware('api').prefix(apiPrefix).group(apiRoute);
    //                         }
    //                     }
    //                 } else {
    //                     Route::middleware('api').prefix(apiPrefix).group(api);
    //                 }
    //             }

    //             if (is_string(health)) {
    //                 Route::get(health, function () {
    //                     exception = null;

    //                     try {
    //                         Event::dispatch(new DiagnosingHealth);
    //                     } catch (\Throwable e) {
    //                         if (app().hasDebugModeEnabled()) {
    //                             throw e;
    //                         }

    //                         report(e);

    //                         exception = e.getMessage();
    //                     }

    //                     return response(View::file(__DIR__.'/../resources/health-up.blade.php', [
    //                         'exception' => exception,
    //                     ]), status: exception ? 500 : 200);
    //                 });
    //             }

    //             if (is_string(web) || is_array(web)) {
    //                 if (is_array(web)) {
    //                     foreach (web as webRoute) {
    //                         if (realpath(webRoute) !== false) {
    //                             Route::middleware('web').group(webRoute);
    //                         }
    //                     }
    //                 } else {
    //                     Route::middleware('web').group(web);
    //                 }
    //             }

    //             foreach (this.additionalRoutingCallbacks as callback) {
    //                 callback();
    //             }

    //             if (is_string(pages) &&
    //                 realpath(pages) !== false &&
    //                 class_exists(Folio::class)) {
    //                 Folio::route(pages, middleware: this.pageMiddleware);
    //             }

    //             if (is_callable(then)) {
    //                 then(this.app);
    //             }
    //         };
    //     }

    //     /**
    //      * Register the global middleware, middleware groups, and middleware aliases for the application.
    //      *
    //      * @param  callable|null  callback
    //      * @return this
    //      */
    //     public withMiddleware(?callable callback = null)
    //     {
    //         this.app.afterResolving(HttpKernel::class, function (kernel) use (callback) {
    //             middleware = (new Middleware)
    //                 .redirectGuestsTo(fn () => route('login'));

    //             if (! is_null(callback)) {
    //                 callback(middleware);
    //             }

    //             this.pageMiddleware = middleware.getPageMiddleware();
    //             kernel.setGlobalMiddleware(middleware.getGlobalMiddleware());
    //             kernel.setMiddlewareGroups(middleware.getMiddlewareGroups());
    //             kernel.setMiddlewareAliases(middleware.getMiddlewareAliases());

    //             if (priorities = middleware.getMiddlewarePriority()) {
    //                 kernel.setMiddlewarePriority(priorities);
    //             }

    //             if (priorityAppends = middleware.getMiddlewarePriorityAppends()) {
    //                 foreach (priorityAppends as newMiddleware => after) {
    //                     kernel.addToMiddlewarePriorityAfter(after, newMiddleware);
    //                 }
    //             }

    //             if (priorityPrepends = middleware.getMiddlewarePriorityPrepends()) {
    //                 foreach (priorityPrepends as newMiddleware => before) {
    //                     kernel.addToMiddlewarePriorityBefore(before, newMiddleware);
    //                 }
    //             }
    //         });

    //         return this;
    //     }

    /**
     * Register additional commands with the application.
     */
    public withCommands(commands: (string | Class)[] = []): this {
        if (commands.length === 0) {
            commands = [this.app.path('console/commands')];
        }

        // @ts-ignore:
        this.app.afterResolving(ConsoleKernel, (kernel: ConsoleKernel) => {
            const partionedCommands = (new Collection(commands)).partition((command) => isClass(command));
            const classCommands = partionedCommands.get(0) as Collection<number, Class>;
            let paths = partionedCommands.get(1) as Collection<number, string>;

            const partionedPaths = paths.partition((path) => existsSync(path, { isFile: true }));
            const routes = partionedPaths.get(0) as Collection<number, string>;
            paths = partionedPaths.get(1);

            this.app.booted(() => {
                kernel.addCommands(classCommands.all() as Class[]);
                kernel.addCommandPaths(paths.all() as string[]);
                kernel.addCommandRoutePaths(routes.all() as string[]);
            });
        });

        return this;
    }

    //     /**
    //      * Register additional Artisan route paths.
    //      *
    //      * @param  array  paths
    //      * @return this
    //      */
    //     protected function withCommandRouting(array paths)
    //     {
    //         this.app.afterResolving(ConsoleKernel::class, function (kernel) use (paths) {
    //             this.app.booted(fn () => kernel.addCommandRoutePaths(paths));
    //         });

    //         return this;
    //     }

    //     /**
    //      * Register the scheduled tasks for the application.
    //      *
    //      * @param  callable(\Illuminate\Console\Scheduling\Schedule schedule): void  callback
    //      * @return this
    //      */
    //     public withSchedule(callable callback)
    //     {
    //         Artisan::starting(fn () => callback(this.app.make(Schedule::class)));

    //         return this;
    //     }

    //     /**
    //      * Register and configure the application's exception handler.
    //      *
    //      * @param  callable|null  using
    //      * @return this
    //      */
    //     public withExceptions(?callable using = null)
    //     {
    //         this.app.singleton(
    //             \Illuminate\Contracts\Debug\ExceptionHandler::class,
    //             \Illuminate\Foundation\Exceptions\Handler::class
    //         );

    //         using ??= fn () => true;

    //         this.app.afterResolving(
    //             \Illuminate\Foundation\Exceptions\Handler::class,
    //             fn (handler) => using(new Exceptions(handler)),
    //         );

    //         return this;
    //     }

    //     /**
    //      * Register an array of container bindings to be bound when the application is booting.
    //      *
    //      * @param  array  bindings
    //      * @return this
    //      */
    //     public withBindings(array bindings)
    //     {
    //         return this.registered(function (app) use (bindings) {
    //             foreach (bindings as abstract => concrete) {
    //                 app.bind(abstract, concrete);
    //             }
    //         });
    //     }

    //     /**
    //      * Register an array of singleton container bindings to be bound when the application is booting.
    //      *
    //      * @param  array  singletons
    //      * @return this
    //      */
    //     public withSingletons(array singletons)
    //     {
    //         return this.registered(function (app) use (singletons) {
    //             foreach (singletons as abstract => concrete) {
    //                 if (is_string(abstract)) {
    //                     app.singleton(abstract, concrete);
    //                 } else {
    //                     app.singleton(concrete);
    //                 }
    //             }
    //         });
    //     }

    //     /**
    //      * Register an array of scoped singleton container bindings to be bound when the application is booting.
    //      *
    //      * @param  array  scopedSingletons
    //      * @return this
    //      */
    //     public withScopedSingletons(array scopedSingletons)
    //     {
    //         return this.registered(function (app) use (scopedSingletons) {
    //             foreach (scopedSingletons as abstract => concrete) {
    //                 if (is_string(abstract)) {
    //                     app.scoped(abstract, concrete);
    //                 } else {
    //                     app.scoped(concrete);
    //                 }
    //             }
    //         });
    //     }

    //     /**
    //      * Register a callback to be invoked when the application's service providers are registered.
    //      *
    //      * @param  callable  callback
    //      * @return this
    //      */
    //     public registered(callable callback)
    //     {
    //         this.app.registered(callback);

    //         return this;
    //     }

    //     /**
    //      * Register a callback to be invoked when the application is "booting".
    //      *
    //      * @param  callable  callback
    //      * @return this
    //      */
    //     public booting(callable callback)
    //     {
    //         this.app.booting(callback);

    //         return this;
    //     }

    //     /**
    //      * Register a callback to be invoked when the application is "booted".
    //      *
    //      * @param  callable  callback
    //      * @return this
    //      */
    //     public booted(callable callback)
    //     {
    //         this.app.booted(callback);

    //         return this;
    //     }

    //     /**
    //      * Get the application instance.
    //      *
    //      * @return \Illuminate\Foundation\Application
    //      */
    //     public create()
    //     {
    //         return this.app;
    //     }
}
