import { in_array, rtrim } from '@balboacodes/php-utils';
import '@std/dotenv/load';
import { SEPARATOR } from '@std/path';
import Container from '../container/Container.ts';
import { join_paths } from '../filesystem/functions.ts';
import Str from '../support/Str.ts';
import { value } from '../support/helpers.ts';

export default class Application extends Container {
    /**
     * The framework version.
     */
    static readonly VERSION = '0.1.0';

    /**
     * The base path for the installation.
     */
    protected basePath?: string;

    /**
     * The array of registered callbacks.
     */
    protected registeredCallbacks: (() => unknown)[] = [];

    /**
     * Indicates if the application has been bootstrapped before.
     */
    protected hasBeenBootstrapped: boolean = false;

    /**
     * Indicates if the application has "booted".
     */
    protected booted: boolean = false;

    /**
     * The array of booting callbacks.
     */
    protected bootingCallbacks: (() => unknown)[] = [];

    /**
     * The array of booted callbacks.
     */
    protected bootedCallbacks: (() => unknown)[] = [];

    /**
     * The array of terminating callbacks.
     */
    protected terminatingCallbacks: (() => unknown)[] = [];

    /**
     * All of the registered service providers.
     *
     * @var array<string, \Illuminate\Support\ServiceProvider>
     */
    protected serviceProviders: ServiceProvider[] = [];

    /**
     * The names of the loaded service providers.
     */
    protected loadedProviders: ServiceProvider[] = [];

    /**
     * The deferred services and their providers.
     */
    protected deferredServices: ServiceProvider[] = [];

    /**
     * The custom bootstrap path defined by the developer.
     */
    protected bootstrapPath?: string;

    /**
     * The custom application path defined by the developer.
     */
    protected appPath?: string;

    /**
     * The custom configuration path defined by the developer.
     */
    protected configPath?: string;

    /**
     * The custom database path defined by the developer.
     */
    protected databasePath?: string;

    /**
     * The custom language file path defined by the developer.
     */
    protected langPath?: string;

    /**
     * The custom public / web path defined by the developer.
     */
    protected publicPath?: string;

    /**
     * The custom storage path defined by the developer.
     */
    protected storagePath?: string;

    /**
     * The custom environment path defined by the developer.
     */
    protected environmentPath?: string;

    /**
     * The environment file to load during bootstrapping.
     */
    protected environmentFile: string = '.env';

    /**
     * Indicates if the application is running in the console.
     */
    protected isRunningInConsole?: boolean;

    /**
     * The application namespace.
     */
    protected namespace?: string;

    /**
     * Indicates if the framework's base configuration should be merged.
     */
    protected mergeFrameworkConfiguration: boolean = true;

    /**
     * The prefixes of absolute cache paths for use during normalization.
     */
    protected $absoluteCachePathPrefixes: string[] = ['/', '\\'];

    /**
     * Create a new application instance.
     */
    public constructor(basePath?: string) {
        super();

        if (basePath) {
            this.setBasePath(basePath);
        }

        this.registerBaseBindings();
        this.registerBaseServiceProviders();
        this.registerCoreContainerAliases();
    }

    /**
     * Begin configuring a new application instance.
     * @return \Illuminate\Foundation\Configuration\ApplicationBuilder
     */
    public static configure(basePath?: string): ApplicationBuilder {
        if (basePath === undefined) {
            basePath = Application.inferBasePath();
        }

        return (new ApplicationBuilder(new Application(basePath)))
            .withKernels()
            .withEvents()
            .withCommands()
            .withProviders();
    }

    /**
     * Infer the application's base directory from the environment.
     */
    public static inferBasePath(): string {
        // @ts-expect-error:
        if (Deno.env.APP_BASE_PATH) {
            // @ts-expect-error:
            return Deno.env.APP_BASE_PATH;
        }

        return Deno.cwd();
    }

    /**
     * Get the version number of the application.
     */
    public version(): string {
        return Application.VERSION;
    }

    /**
     * Register the basic bindings into the container.
     */
    protected registerBaseBindings(): void {
        Application.setInstance(this);

        this.instance('app', this);

        this.instance(Container, this);
    }

    /**
     * Register all of the base service providers.
     */
    protected registerBaseServiceProviders(): void {
        this.register(new EventServiceProvider(this));
        this.register(new LogServiceProvider(this));
        this.register(new ContextServiceProvider(this));
        this.register(new RoutingServiceProvider(this));
    }

    /**
     * Run the given array of bootstrap classes.
     */
    public bootstrapWith(bootstrappers: string[]): void {
        this.hasBeenBootstrapped = true;

        for (const bootstrapper of bootstrappers) {
            // @ts-expect-error: need better typing
            this.make('events').dispatch('bootstrapping: ' + bootstrapper, [this]);

            // @ts-expect-error: need better typing
            this.make(bootstrapper).bootstrap(this);

            // @ts-expect-error: need better typing
            this.make('events').dispatch('bootstrapped: ' + bootstrapper, [this]);
        }
    }

    /**
     * Register a callback to run after loading the environment.
     */
    public afterLoadingEnvironment(callback: () => unknown): void {
        this.afterBootstrapping(LoadEnvironmentVariables.name, callback);
    }

    /**
     * Register a callback to run before a bootstrapper.
     */
    public beforeBootstrapping(bootstrapper: string, callback: () => unknown): void {
        // @ts-expect-error: need better typing
        this.make('events').listen('bootstrapping: ' + bootstrapper, callback);
    }

    /**
     * Register a callback to run after a bootstrapper.
     */
    public afterBootstrapping(bootstrapper: string, callback: () => unknown): void {
        // @ts-expect-error: need better typing
        this.make('events').listen('bootstrapped: ' + bootstrapper, callback);
    }

    /**
     * Determine if the application has been bootstrapped before.
     */
    public getHasBeenBootstrapped(): boolean {
        return this.hasBeenBootstrapped;
    }

    /**
     * Set the base path for the application.
     */
    public setBasePath(basePath: string): this {
        this.basePath = rtrim(basePath, '/');

        this.bindPathsInContainer();

        return this;
    }

    /**
     * Bind all of the application paths in the container.
     */
    protected bindPathsInContainer(): void {
        this.instance('path', this.path());
        this.instance('path.base', this.getBasePath());
        this.instance('path.config', this.getConfigPath());
        this.instance('path.database', this.getDatabasePath());
        this.instance('path.public', this.getPublicPath());
        this.instance('path.resources', this.getResourcePath());
        this.instance('path.storage', this.getStoragePath());

        this.useBootstrapPath(value(() => {
            const directory = this.getBasePath('.laravel');
            return is_dir(directory) ? directory : this.getBasePath('bootstrap');
        }));

        this.useLangPath(value(() => {
            const directory = this.getResourcePath('lang');
            return is_dir(directory) ? directory : this.getBasePath('lang');
        }));
    }

    /**
     * Get the path to the application "app" directory.
     */
    public path(path: string = ''): string {
        return this.joinPaths(this.appPath ?? this.getBasePath('app'), path);
    }

    /**
     * Set the application directory.
     */
    public useAppPath(path: string): this {
        this.appPath = path;

        this.instance('path', path);

        return this;
    }

    /**
     * Get the base path of the installation.
     */
    public getBasePath(path: string = ''): string {
        return this.joinPaths(this.basePath, path);
    }

    /**
     * Get the path to the bootstrap directory.
     */
    public getBootstrapPath(path: string = ''): string {
        return this.joinPaths(this.bootstrapPath, path);
    }

    /**
     * Get the path to the service provider list in the bootstrap directory.
     */
    public getBootstrapProvidersPath(): string {
        return this.getBootstrapPath('providers.ts');
    }

    /**
     * Set the bootstrap file directory.
     */
    public useBootstrapPath(path: string): this {
        this.bootstrapPath = path;

        this.instance('path.bootstrap', path);

        return this;
    }

    /**
     * Get the path to the application configuration files.
     */
    public getConfigPath(path: string = ''): string {
        return this.joinPaths(this.configPath ?? this.getBasePath('config'), path);
    }

    /**
     * Set the configuration directory.
     */
    public useConfigPath(path: string): this {
        this.configPath = path;

        this.instance('path.config', path);

        return this;
    }

    /**
     * Get the path to the database directory.
     */
    public getDatabasePath(path: string = ''): string {
        return this.joinPaths(this.databasePath ?? this.getBasePath('database'), path);
    }

    /**
     * Set the database directory.
     */
    public useDatabasePath(path: string): this {
        this.databasePath = path;

        this.instance('path.database', path);

        return this;
    }

    /**
     * Get the path to the language files.
     */
    public getLangPath(path: string = ''): string {
        return this.joinPaths(this.langPath, path);
    }

    /**
     * Set the language file directory.
     */
    public useLangPath(path: string): this {
        this.langPath = path;

        this.instance('path.lang', path);

        return this;
    }

    /**
     * Get the path to the public / web directory.
     */
    public getPublicPath(path: string = ''): string {
        return this.joinPaths(this.publicPath ?? this.getBasePath('public'), path);
    }

    /**
     * Set the public / web directory.
     */
    public usePublicPath(path: string): this {
        this.publicPath = path;

        this.instance('path.public', path);

        return this;
    }

    /**
     * Get the path to the storage directory.
     */
    public getStoragePath(path: string = ''): string {
        // @ts-expect-error:
        if (Deno.env.LARAVEL_STORAGE_PATH) {
            // @ts-expect-error:
            return this.joinPaths(this.storagePath ?? Deno.env.LARAVEL_STORAGE_PATH, path);
        }

        return this.joinPaths(this.storagePath ?? this.getBasePath('storage'), path);
    }

    /**
     * Set the storage directory.
     */
    public useStoragePath(path: string): this {
        this.storagePath = path;

        this.instance('path.storage', path);

        return this;
    }

    /**
     * Get the path to the resources directory.
     */
    public resourcePath(path: string = ''): string {
        return this.joinPaths(this.getBasePath('resources'), path);
    }

    /**
     * Get the path to the views directory.
     *
     * This method returns the first configured path in the array of view paths.
     */
    public viewPath(path: string = ''): string {
        // @ts-expect-error: need better typing
        const viewPath = rtrim(this.make('config').get('view.paths')[0], SEPARATOR);

        return this.joinPaths(viewPath, path);
    }

    /**
     * Join the given paths together.
     */
    public joinPaths(basePath: string, path: string = ''): string {
        return join_paths(basePath, path);
    }

    /**
     * Get the path to the environment file directory.
     */
    public getEnvironmentPath(): string | undefined {
        return this.environmentPath ?? this.basePath;
    }

    /**
     * Set the directory for the environment file.
     */
    public useEnvironmentPath(path: string): this {
        this.environmentPath = path;

        return this;
    }

    /**
     * Set the environment file to be loaded during bootstrapping.
     */
    public loadEnvironmentFrom(file: string): this {
        this.environmentFile = file;

        return this;
    }

    /**
     * Get the environment file the application is using.
     */
    public getEnvironmentFile(): string {
        return this.environmentFile || '.env';
    }

    /**
     * Get the fully qualified path to the environment file.
     */
    public environmentFilePath(): string {
        return this.getEnvironmentPath() + SEPARATOR + this.getEnvironmentFile();
    }

    /**
     * Get or check the current application environment.
     */
    public environment(...environments: string[]): string | boolean {
        if (environments.length > 0) {
            const patterns = Array.isArray(environments[0]) ? environments[0] : environments;

            return Str.is(patterns, this.make('env') as string);
        }

        return this.make('env') as string;
    }

    /**
     * Determine if the application is in the local environment.
     */
    public isLocal(): boolean {
        return this.make('env') === 'local';
    }

    /**
     * Determine if the application is in the production environment.
     */
    public isProduction(): boolean {
        return this.make('env') === 'production';
    }

    /**
     * Detect the application's current environment.
     */
    public detectEnvironment(callback: () => unknown): string {
        const args = this.runningInConsole() && Deno.args ? Deno.args : null;

        this.bind('env', () => new EnvironmentDetector().detect(callback, args));

        return this.make('env') as string;
    }

    /**
     * Determine if the application is running in the console.
     */
    public runningInConsole(): boolean {
        if (this.isRunningInConsole === undefined) {
            this.isRunningInConsole = Env.get('APP_RUNNING_IN_CONSOLE') ?? Deno.env.get('TERM') !== undefined;
        }

        return this.isRunningInConsole as boolean;
    }

    /**
     * Determine if the application is running any of the given console commands.
     */
    public runningConsoleCommand(...commands: string[]): boolean {
        if (!this.runningInConsole()) {
            return false;
        }

        return in_array(Deno.args[0] ?? null, Array.isArray(commands[0]) ? commands[0] : commands);
    }

    /**
     * Determine if the application is running unit tests.
     */
    public runningUnitTests(): boolean {
        return this.bound('env') && this.make('env') === 'testing';
    }

    /**
     * Determine if the application is running with debug mode enabled.
     */
    public hasDebugModeEnabled(): boolean {
        return !!this.make('config').get('app.debug');
    }

    /**
     * Register a new registered listener.
     */
    public registered(callback: () => unknown): void {
        this.registeredCallbacks.push(callback);
    }

    //     /**
    //      * Register all of the configured providers.
    //      *
    //      * @return void
    //      */
    //     public registerConfiguredProviders()
    //     {
    //         $providers = (new Collection($this->make('config')->get('app.providers')))
    //             ->partition(fn ($provider) => str_starts_with($provider, 'Illuminate\\'));

    //         $providers->splice(1, 0, [$this->make(PackageManifest::class)->providers()]);

    //         (new ProviderRepository($this, new Filesystem, $this->getCachedServicesPath()))
    //             ->load($providers->collapse()->toArray());

    //         $this->fireAppCallbacks($this->registeredCallbacks);
    //     }

    //     /**
    //      * Register a service provider with the application.
    //      *
    //      * @param  \Illuminate\Support\ServiceProvider|string  $provider
    //      * @param  bool  $force
    //      * @return \Illuminate\Support\ServiceProvider
    //      */
    //     public register($provider, $force = false)
    //     {
    //         if (($registered = $this->getProvider($provider)) && ! $force) {
    //             return $registered;
    //         }

    //         // If the given "provider" is a string, we will resolve it, passing in the
    //         // application instance automatically for the developer. This is simply
    //         // a more convenient way of specifying your service provider classes.
    //         if (is_string($provider)) {
    //             $provider = $this->resolveProvider($provider);
    //         }

    //         $provider->register();

    //         // If there are bindings / singletons set as properties on the provider we
    //         // will spin through them and register them with the application, which
    //         // serves as a convenience layer while registering a lot of bindings.
    //         if (property_exists($provider, 'bindings')) {
    //             foreach ($provider->bindings as $key => $value) {
    //                 $this->bind($key, $value);
    //             }
    //         }

    //         if (property_exists($provider, 'singletons')) {
    //             foreach ($provider->singletons as $key => $value) {
    //                 $key = is_int($key) ? $value : $key;

    //                 $this->singleton($key, $value);
    //             }
    //         }

    //         $this->markAsRegistered($provider);

    //         // If the application has already booted, we will call this boot method on
    //         // the provider class so it has an opportunity to do its boot logic and
    //         // will be ready for any usage by this developer's application logic.
    //         if ($this->isBooted()) {
    //             $this->bootProvider($provider);
    //         }

    //         return $provider;
    //     }

    //     /**
    //      * Get the registered service provider instance if it exists.
    //      *
    //      * @param  \Illuminate\Support\ServiceProvider|string  $provider
    //      * @return \Illuminate\Support\ServiceProvider|null
    //      */
    //     public getProvider($provider)
    //     {
    //         $name = is_string($provider) ? $provider : get_class($provider);

    //         return $this->serviceProviders[$name] ?? null;
    //     }

    //     /**
    //      * Get the registered service provider instances if any exist.
    //      *
    //      * @param  \Illuminate\Support\ServiceProvider|string  $provider
    //      * @return array
    //      */
    //     public getProviders($provider)
    //     {
    //         $name = is_string($provider) ? $provider : get_class($provider);

    //         return Arr::where($this->serviceProviders, fn ($value) => $value instanceof $name);
    //     }

    //     /**
    //      * Resolve a service provider instance from the class name.
    //      *
    //      * @param  string  $provider
    //      * @return \Illuminate\Support\ServiceProvider
    //      */
    //     public resolveProvider($provider)
    //     {
    //         return new $provider($this);
    //     }

    //     /**
    //      * Mark the given provider as registered.
    //      *
    //      * @param  \Illuminate\Support\ServiceProvider  $provider
    //      * @return void
    //      */
    //     protected function markAsRegistered($provider)
    //     {
    //         $class = get_class($provider);

    //         $this->serviceProviders[$class] = $provider;

    //         $this->loadedProviders[$class] = true;
    //     }

    //     /**
    //      * Load and boot all of the remaining deferred providers.
    //      *
    //      * @return void
    //      */
    //     public loadDeferredProviders()
    //     {
    //         // We will simply spin through each of the deferred providers and register each
    //         // one and boot them if the application has booted. This should make each of
    //         // the remaining services available to this application for immediate use.
    //         foreach ($this->deferredServices as $service => $provider) {
    //             $this->loadDeferredProvider($service);
    //         }

    //         $this->deferredServices = [];
    //     }

    //     /**
    //      * Load the provider for a deferred service.
    //      *
    //      * @param  string  $service
    //      * @return void
    //      */
    //     public loadDeferredProvider($service)
    //     {
    //         if (! $this->isDeferredService($service)) {
    //             return;
    //         }

    //         $provider = $this->deferredServices[$service];

    //         // If the service provider has not already been loaded and registered we can
    //         // register it with the application and remove the service from this list
    //         // of deferred services, since it will already be loaded on subsequent.
    //         if (! isset($this->loadedProviders[$provider])) {
    //             $this->registerDeferredProvider($provider, $service);
    //         }
    //     }

    //     /**
    //      * Register a deferred provider and service.
    //      *
    //      * @param  string  $provider
    //      * @param  string|null  $service
    //      * @return void
    //      */
    //     public registerDeferredProvider($provider, $service = null)
    //     {
    //         // Once the provider that provides the deferred service has been registered we
    //         // will remove it from our local list of the deferred services with related
    //         // providers so that this container does not try to resolve it out again.
    //         if ($service) {
    //             unset($this->deferredServices[$service]);
    //         }

    //         $this->register($instance = new $provider($this));

    //         if (! $this->isBooted()) {
    //             $this->booting(function () use ($instance) {
    //                 $this->bootProvider($instance);
    //             });
    //         }
    //     }

    //     /**
    //      * Resolve the given type from the container.
    //      *
    //      * @template TClass of object
    //      *
    //      * @param  string|class-string<TClass>  $abstract
    //      * @param  array  $parameters
    //      * @return ($abstract is class-string<TClass> ? TClass : mixed)
    //      *
    //      * @throws \Illuminate\Contracts\Container\BindingResolutionException
    //      */
    //     public make($abstract, array $parameters = [])
    //     {
    //         $this->loadDeferredProviderIfNeeded($abstract = $this->getAlias($abstract));

    //         return parent::make($abstract, $parameters);
    //     }

    //     /**
    //      * Resolve the given type from the container.
    //      *
    //      * @template TClass of object
    //      *
    //      * @param  string|class-string<TClass>|callable  $abstract
    //      * @param  array  $parameters
    //      * @param  bool  $raiseEvents
    //      * @return ($abstract is class-string<TClass> ? TClass : mixed)
    //      *
    //      * @throws \Illuminate\Contracts\Container\BindingResolutionException
    //      * @throws \Illuminate\Contracts\Container\CircularDependencyException
    //      */
    //     protected function resolve($abstract, $parameters = [], $raiseEvents = true)
    //     {
    //         $this->loadDeferredProviderIfNeeded($abstract = $this->getAlias($abstract));

    //         return parent::resolve($abstract, $parameters, $raiseEvents);
    //     }

    //     /**
    //      * Load the deferred provider if the given type is a deferred service and the instance has not been loaded.
    //      *
    //      * @param  string  $abstract
    //      * @return void
    //      */
    //     protected function loadDeferredProviderIfNeeded($abstract)
    //     {
    //         if ($this->isDeferredService($abstract) && ! isset($this->instances[$abstract])) {
    //             $this->loadDeferredProvider($abstract);
    //         }
    //     }

    //     /**
    //      * Determine if the given abstract type has been bound.
    //      *
    //      * @param  string  $abstract
    //      * @return bool
    //      */
    //     public bound($abstract)
    //     {
    //         return $this->isDeferredService($abstract) || parent::bound($abstract);
    //     }

    //     /**
    //      * Determine if the application has booted.
    //      *
    //      * @return bool
    //      */
    //     public isBooted()
    //     {
    //         return $this->booted;
    //     }

    //     /**
    //      * Boot the application's service providers.
    //      *
    //      * @return void
    //      */
    //     public boot()
    //     {
    //         if ($this->isBooted()) {
    //             return;
    //         }

    //         // Once the application has booted we will also fire some "booted" callbacks
    //         // for any listeners that need to do work after this initial booting gets
    //         // finished. This is useful when ordering the boot-up processes we run.
    //         $this->fireAppCallbacks($this->bootingCallbacks);

    //         array_walk($this->serviceProviders, function ($p) {
    //             $this->bootProvider($p);
    //         });

    //         $this->booted = true;

    //         $this->fireAppCallbacks($this->bootedCallbacks);
    //     }

    //     /**
    //      * Boot the given service provider.
    //      *
    //      * @param  \Illuminate\Support\ServiceProvider  $provider
    //      * @return void
    //      */
    //     protected function bootProvider(ServiceProvider $provider)
    //     {
    //         $provider->callBootingCallbacks();

    //         if (method_exists($provider, 'boot')) {
    //             $this->call([$provider, 'boot']);
    //         }

    //         $provider->callBootedCallbacks();
    //     }

    //     /**
    //      * Register a new boot listener.
    //      *
    //      * @param  callable  $callback
    //      * @return void
    //      */
    //     public booting($callback)
    //     {
    //         $this->bootingCallbacks[] = $callback;
    //     }

    //     /**
    //      * Register a new "booted" listener.
    //      *
    //      * @param  callable  $callback
    //      * @return void
    //      */
    //     public booted($callback)
    //     {
    //         $this->bootedCallbacks[] = $callback;

    //         if ($this->isBooted()) {
    //             $callback($this);
    //         }
    //     }

    //     /**
    //      * Call the booting callbacks for the application.
    //      *
    //      * @param  callable[]  $callbacks
    //      * @return void
    //      */
    //     protected function fireAppCallbacks(array &$callbacks)
    //     {
    //         $index = 0;

    //         while ($index < count($callbacks)) {
    //             $callbacks[$index]($this);

    //             $index++;
    //         }
    //     }

    //     /**
    //      * {@inheritdoc}
    //      *
    //      * @return \Symfony\Component\HttpFoundation\Response
    //      */
    //     public handle(SymfonyRequest $request, int $type = self::MAIN_REQUEST, bool $catch = true): SymfonyResponse
    //     {
    //         return $this[HttpKernelContract::class]->handle(Request::createFromBase($request));
    //     }

    //     /**
    //      * Handle the incoming HTTP request and send the response to the browser.
    //      *
    //      * @param  \Illuminate\Http\Request  $request
    //      * @return void
    //      */
    //     public handleRequest(Request $request)
    //     {
    //         $kernel = $this->make(HttpKernelContract::class);

    //         $response = $kernel->handle($request)->send();

    //         $kernel->terminate($request, $response);
    //     }

    //     /**
    //      * Handle the incoming Artisan command.
    //      *
    //      * @param  \Symfony\Component\Console\Input\InputInterface  $input
    //      * @return int
    //      */
    //     public handleCommand(InputInterface $input)
    //     {
    //         $kernel = $this->make(ConsoleKernelContract::class);

    //         $status = $kernel->handle(
    //             $input,
    //             new ConsoleOutput
    //         );

    //         $kernel->terminate($input, $status);

    //         return $status;
    //     }

    //     /**
    //      * Determine if the framework's base configuration should be merged.
    //      *
    //      * @return bool
    //      */
    //     public shouldMergeFrameworkConfiguration()
    //     {
    //         return $this->mergeFrameworkConfiguration;
    //     }

    //     /**
    //      * Indicate that the framework's base configuration should not be merged.
    //      *
    //      * @return $this
    //      */
    //     public dontMergeFrameworkConfiguration()
    //     {
    //         $this->mergeFrameworkConfiguration = false;

    //         return $this;
    //     }

    //     /**
    //      * Determine if middleware has been disabled for the application.
    //      *
    //      * @return bool
    //      */
    //     public shouldSkipMiddleware()
    //     {
    //         return $this->bound('middleware.disable') &&
    //                $this->make('middleware.disable') === true;
    //     }

    //     /**
    //      * Get the path to the cached services.php file.
    //      *
    //      * @return string
    //      */
    //     public getCachedServicesPath()
    //     {
    //         return $this->normalizeCachePath('APP_SERVICES_CACHE', 'cache/services.php');
    //     }

    //     /**
    //      * Get the path to the cached packages.php file.
    //      *
    //      * @return string
    //      */
    //     public getCachedPackagesPath()
    //     {
    //         return $this->normalizeCachePath('APP_PACKAGES_CACHE', 'cache/packages.php');
    //     }

    //     /**
    //      * Determine if the application configuration is cached.
    //      *
    //      * @return bool
    //      */
    //     public configurationIsCached()
    //     {
    //         if ($this->bound('config_loaded_from_cache')) {
    //             return (bool) $this->make('config_loaded_from_cache');
    //         }

    //         return $this->instance('config_loaded_from_cache', is_file($this->getCachedConfigPath()));
    //     }

    //     /**
    //      * Get the path to the configuration cache file.
    //      *
    //      * @return string
    //      */
    //     public getCachedConfigPath()
    //     {
    //         return $this->normalizeCachePath('APP_CONFIG_CACHE', 'cache/config.php');
    //     }

    //     /**
    //      * Determine if the application routes are cached.
    //      *
    //      * @return bool
    //      */
    //     public routesAreCached()
    //     {
    //         if ($this->bound('routes.cached')) {
    //             return (bool) $this->make('routes.cached');
    //         }

    //         return $this->instance('routes.cached', $this['files']->exists($this->getCachedRoutesPath()));
    //     }

    //     /**
    //      * Get the path to the routes cache file.
    //      *
    //      * @return string
    //      */
    //     public getCachedRoutesPath()
    //     {
    //         return $this->normalizeCachePath('APP_ROUTES_CACHE', 'cache/routes-v7.php');
    //     }

    //     /**
    //      * Determine if the application events are cached.
    //      *
    //      * @return bool
    //      */
    //     public eventsAreCached()
    //     {
    //         if ($this->bound('events.cached')) {
    //             return (bool) $this->make('events.cached');
    //         }

    //         return $this->instance(
    //             'events.cached', $this['files']->exists($this->getCachedEventsPath())
    //         );
    //     }

    //     /**
    //      * Get the path to the events cache file.
    //      *
    //      * @return string
    //      */
    //     public getCachedEventsPath()
    //     {
    //         return $this->normalizeCachePath('APP_EVENTS_CACHE', 'cache/events.php');
    //     }

    //     /**
    //      * Normalize a relative or absolute path to a cache file.
    //      *
    //      * @param  string  $key
    //      * @param  string  $default
    //      * @return string
    //      */
    //     protected function normalizeCachePath($key, $default)
    //     {
    //         if (is_null($env = Env::get($key))) {
    //             return $this->bootstrapPath($default);
    //         }

    //         return Str::startsWith($env, $this->absoluteCachePathPrefixes)
    //             ? $env
    //             : $this->basePath($env);
    //     }

    //     /**
    //      * Add new prefix to list of absolute path prefixes.
    //      *
    //      * @param  string  $prefix
    //      * @return $this
    //      */
    //     public addAbsoluteCachePathPrefix($prefix)
    //     {
    //         $this->absoluteCachePathPrefixes[] = $prefix;

    //         return $this;
    //     }

    //     /**
    //      * Get an instance of the maintenance mode manager implementation.
    //      *
    //      * @return \Illuminate\Contracts\Foundation\MaintenanceMode
    //      */
    //     public maintenanceMode()
    //     {
    //         return $this->make(MaintenanceModeContract::class);
    //     }

    //     /**
    //      * Determine if the application is currently down for maintenance.
    //      *
    //      * @return bool
    //      */
    //     public isDownForMaintenance()
    //     {
    //         return $this->maintenanceMode()->active();
    //     }

    //     /**
    //      * Throw an HttpException with the given data.
    //      *
    //      * @param  int  $code
    //      * @param  string  $message
    //      * @param  array  $headers
    //      * @return never
    //      *
    //      * @throws \Symfony\Component\HttpKernel\Exception\HttpException
    //      * @throws \Symfony\Component\HttpKernel\Exception\NotFoundHttpException
    //      */
    //     public abort($code, $message = '', array $headers = [])
    //     {
    //         if ($code == 404) {
    //             throw new NotFoundHttpException($message, null, 0, $headers);
    //         }

    //         throw new HttpException($code, $message, null, $headers);
    //     }

    //     /**
    //      * Register a terminating callback with the application.
    //      *
    //      * @param  callable|string  $callback
    //      * @return $this
    //      */
    //     public terminating($callback)
    //     {
    //         $this->terminatingCallbacks[] = $callback;

    //         return $this;
    //     }

    //     /**
    //      * Terminate the application.
    //      *
    //      * @return void
    //      */
    //     public terminate()
    //     {
    //         $index = 0;

    //         while ($index < count($this->terminatingCallbacks)) {
    //             $this->call($this->terminatingCallbacks[$index]);

    //             $index++;
    //         }
    //     }

    //     /**
    //      * Get the service providers that have been loaded.
    //      *
    //      * @return array<string, bool>
    //      */
    //     public getLoadedProviders()
    //     {
    //         return $this->loadedProviders;
    //     }

    //     /**
    //      * Determine if the given service provider is loaded.
    //      *
    //      * @param  string  $provider
    //      * @return bool
    //      */
    //     public providerIsLoaded(string $provider)
    //     {
    //         return isset($this->loadedProviders[$provider]);
    //     }

    //     /**
    //      * Get the application's deferred services.
    //      *
    //      * @return array
    //      */
    //     public getDeferredServices()
    //     {
    //         return $this->deferredServices;
    //     }

    //     /**
    //      * Set the application's deferred services.
    //      *
    //      * @param  array  $services
    //      * @return void
    //      */
    //     public setDeferredServices(array $services)
    //     {
    //         $this->deferredServices = $services;
    //     }

    //     /**
    //      * Determine if the given service is a deferred service.
    //      *
    //      * @param  string  $service
    //      * @return bool
    //      */
    //     public isDeferredService($service)
    //     {
    //         return isset($this->deferredServices[$service]);
    //     }

    //     /**
    //      * Add an array of services to the application's deferred services.
    //      *
    //      * @param  array  $services
    //      * @return void
    //      */
    //     public addDeferredServices(array $services)
    //     {
    //         $this->deferredServices = array_merge($this->deferredServices, $services);
    //     }

    //     /**
    //      * Remove an array of services from the application's deferred services.
    //      *
    //      * @param  array  $services
    //      * @return void
    //      */
    //     public removeDeferredServices(array $services)
    //     {
    //         foreach ($services as $service) {
    //             unset($this->deferredServices[$service]);
    //         }
    //     }

    //     /**
    //      * Configure the real-time facade namespace.
    //      *
    //      * @param  string  $namespace
    //      * @return void
    //      */
    //     public provideFacades($namespace)
    //     {
    //         AliasLoader::setFacadeNamespace($namespace);
    //     }

    //     /**
    //      * Get the current application locale.
    //      *
    //      * @return string
    //      */
    //     public getLocale()
    //     {
    //         return $this['config']->get('app.locale');
    //     }

    //     /**
    //      * Get the current application locale.
    //      *
    //      * @return string
    //      */
    //     public currentLocale()
    //     {
    //         return $this->getLocale();
    //     }

    //     /**
    //      * Get the current application fallback locale.
    //      *
    //      * @return string
    //      */
    //     public getFallbackLocale()
    //     {
    //         return $this['config']->get('app.fallback_locale');
    //     }

    //     /**
    //      * Set the current application locale.
    //      *
    //      * @param  string  $locale
    //      * @return void
    //      */
    //     public setLocale($locale)
    //     {
    //         $this['config']->set('app.locale', $locale);

    //         $this['translator']->setLocale($locale);

    //         $this['events']->dispatch(new LocaleUpdated($locale));
    //     }

    //     /**
    //      * Set the current application fallback locale.
    //      *
    //      * @param  string  $fallbackLocale
    //      * @return void
    //      */
    //     public setFallbackLocale($fallbackLocale)
    //     {
    //         $this['config']->set('app.fallback_locale', $fallbackLocale);

    //         $this['translator']->setFallback($fallbackLocale);
    //     }

    //     /**
    //      * Determine if the application locale is the given locale.
    //      *
    //      * @param  string  $locale
    //      * @return bool
    //      */
    //     public isLocale($locale)
    //     {
    //         return $this->getLocale() == $locale;
    //     }

    //     /**
    //      * Register the core class aliases in the container.
    //      *
    //      * @return void
    //      */
    //     public registerCoreContainerAliases()
    //     {
    //         foreach ([
    //             'app' => [self::class, \Illuminate\Contracts\Container\Container::class, \Illuminate\Contracts\Foundation\Application::class, \Psr\Container\ContainerInterface::class],
    //             'auth' => [\Illuminate\Auth\AuthManager::class, \Illuminate\Contracts\Auth\Factory::class],
    //             'auth.driver' => [\Illuminate\Contracts\Auth\Guard::class],
    //             'auth.password' => [\Illuminate\Auth\Passwords\PasswordBrokerManager::class, \Illuminate\Contracts\Auth\PasswordBrokerFactory::class],
    //             'auth.password.broker' => [\Illuminate\Auth\Passwords\PasswordBroker::class, \Illuminate\Contracts\Auth\PasswordBroker::class],
    //             'blade.compiler' => [\Illuminate\View\Compilers\BladeCompiler::class],
    //             'cache' => [\Illuminate\Cache\CacheManager::class, \Illuminate\Contracts\Cache\Factory::class],
    //             'cache.store' => [\Illuminate\Cache\Repository::class, \Illuminate\Contracts\Cache\Repository::class, \Psr\SimpleCache\CacheInterface::class],
    //             'cache.psr6' => [\Symfony\Component\Cache\Adapter\Psr16Adapter::class, \Symfony\Component\Cache\Adapter\AdapterInterface::class, \Psr\Cache\CacheItemPoolInterface::class],
    //             'config' => [\Illuminate\Config\Repository::class, \Illuminate\Contracts\Config\Repository::class],
    //             'cookie' => [\Illuminate\Cookie\CookieJar::class, \Illuminate\Contracts\Cookie\Factory::class, \Illuminate\Contracts\Cookie\QueueingFactory::class],
    //             'db' => [\Illuminate\Database\DatabaseManager::class, \Illuminate\Database\ConnectionResolverInterface::class],
    //             'db.connection' => [\Illuminate\Database\Connection::class, \Illuminate\Database\ConnectionInterface::class],
    //             'db.schema' => [\Illuminate\Database\Schema\Builder::class],
    //             'encrypter' => [\Illuminate\Encryption\Encrypter::class, \Illuminate\Contracts\Encryption\Encrypter::class, \Illuminate\Contracts\Encryption\StringEncrypter::class],
    //             'events' => [\Illuminate\Events\Dispatcher::class, \Illuminate\Contracts\Events\Dispatcher::class],
    //             'files' => [\Illuminate\Filesystem\Filesystem::class],
    //             'filesystem' => [\Illuminate\Filesystem\FilesystemManager::class, \Illuminate\Contracts\Filesystem\Factory::class],
    //             'filesystem.disk' => [\Illuminate\Contracts\Filesystem\Filesystem::class],
    //             'filesystem.cloud' => [\Illuminate\Contracts\Filesystem\Cloud::class],
    //             'hash' => [\Illuminate\Hashing\HashManager::class],
    //             'hash.driver' => [\Illuminate\Contracts\Hashing\Hasher::class],
    //             'log' => [\Illuminate\Log\LogManager::class, \Psr\Log\LoggerInterface::class],
    //             'mail.manager' => [\Illuminate\Mail\MailManager::class, \Illuminate\Contracts\Mail\Factory::class],
    //             'mailer' => [\Illuminate\Mail\Mailer::class, \Illuminate\Contracts\Mail\Mailer::class, \Illuminate\Contracts\Mail\MailQueue::class],
    //             'queue' => [\Illuminate\Queue\QueueManager::class, \Illuminate\Contracts\Queue\Factory::class, \Illuminate\Contracts\Queue\Monitor::class],
    //             'queue.connection' => [\Illuminate\Contracts\Queue\Queue::class],
    //             'queue.failer' => [\Illuminate\Queue\Failed\FailedJobProviderInterface::class],
    //             'redirect' => [\Illuminate\Routing\Redirector::class],
    //             'redis' => [\Illuminate\Redis\RedisManager::class, \Illuminate\Contracts\Redis\Factory::class],
    //             'redis.connection' => [\Illuminate\Redis\Connections\Connection::class, \Illuminate\Contracts\Redis\Connection::class],
    //             'request' => [\Illuminate\Http\Request::class, \Symfony\Component\HttpFoundation\Request::class],
    //             'router' => [\Illuminate\Routing\Router::class, \Illuminate\Contracts\Routing\Registrar::class, \Illuminate\Contracts\Routing\BindingRegistrar::class],
    //             'session' => [\Illuminate\Session\SessionManager::class],
    //             'session.store' => [\Illuminate\Session\Store::class, \Illuminate\Contracts\Session\Session::class],
    //             'translator' => [\Illuminate\Translation\Translator::class, \Illuminate\Contracts\Translation\Translator::class],
    //             'url' => [\Illuminate\Routing\UrlGenerator::class, \Illuminate\Contracts\Routing\UrlGenerator::class],
    //             'validator' => [\Illuminate\Validation\Factory::class, \Illuminate\Contracts\Validation\Factory::class],
    //             'view' => [\Illuminate\View\Factory::class, \Illuminate\Contracts\View\Factory::class],
    //         ] as $key => $aliases) {
    //             foreach ($aliases as $alias) {
    //                 $this->alias($key, $alias);
    //             }
    //         }
    //     }

    //     /**
    //      * Flush the container of all bindings and resolved instances.
    //      *
    //      * @return void
    //      */
    //     public flush()
    //     {
    //         parent::flush();

    //         $this->buildStack = [];
    //         $this->loadedProviders = [];
    //         $this->bootedCallbacks = [];
    //         $this->bootingCallbacks = [];
    //         $this->deferredServices = [];
    //         $this->reboundCallbacks = [];
    //         $this->serviceProviders = [];
    //         $this->resolvingCallbacks = [];
    //         $this->terminatingCallbacks = [];
    //         $this->beforeResolvingCallbacks = [];
    //         $this->afterResolvingCallbacks = [];
    //         $this->globalBeforeResolvingCallbacks = [];
    //         $this->globalResolvingCallbacks = [];
    //         $this->globalAfterResolvingCallbacks = [];
    //     }

    //     /**
    //      * Get the application namespace.
    //      *
    //      * @return string
    //      *
    //      * @throws \RuntimeException
    //      */
    //     public getNamespace()
    //     {
    //         if (! is_null($this->namespace)) {
    //             return $this->namespace;
    //         }

    //         $composer = json_decode(file_get_contents($this->basePath('composer.json')), true);

    //         foreach ((array) data_get($composer, 'autoload.psr-4') as $namespace => $path) {
    //             foreach ((array) $path as $pathChoice) {
    //                 if (realpath($this->path()) === realpath($this->basePath($pathChoice))) {
    //                     return $this->namespace = $namespace;
    //                 }
    //             }
    //         }

    //         throw new RuntimeException('Unable to detect application namespace.');
    //     }
}
