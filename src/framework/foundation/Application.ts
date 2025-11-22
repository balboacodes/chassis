import { rtrim } from '@balboacodes/php-utils';
import { exists } from '@std/fs';
import { dirname, SEPARATOR } from '@std/path';
import { Container } from '../container/Container.ts';
import { Filesystem } from '../filesystem/Filesystem.ts';
import { join_paths } from '../filesystem/functions.ts';
import { Arr } from '../support/Arr.ts';
import { Collection } from '../support/Collection.ts';
import { Env } from '../support/Env.ts';
import { isClass } from '../support/helpers.ts';
import { ServiceProvider } from '../support/ServiceProvider.ts';
import { Str } from '../support/Str.ts';
import { Abstract, Class } from '../types.ts';
import { EnvironmentDetector } from './EnvironmentDetector.ts';
import { ProviderRepository } from './ProviderRepository.ts';

export class Application extends Container {
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
    protected beenBootstrapped: boolean = false;

    /**
     * Indicates if the application has "booted".
     */
    protected hasBooted: boolean = false;

    /**
     * The array of booting callbacks.
     */
    protected bootingCallbacks: (() => unknown)[] = [];

    /**
     * The array of booted callbacks.
     */
    protected bootedCallbacks: ((application: Application) => unknown)[] = [];

    /**
     * The array of terminating callbacks.
     */
    protected terminatingCallbacks: (() => unknown)[] = [];

    /**
     * All of the registered service providers.
     */
    protected serviceProviders: Map<Class<ServiceProvider> | string, ServiceProvider> = new Map();

    /**
     * The names of the loaded service providers.
     */
    protected loadedProviders: Map<string | Class<ServiceProvider>, boolean> = new Map();

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
     * Indicates if the framework's base configuration should be merged.
     */
    protected mergeFrameworkConfiguration: boolean = true;

    /**
     * The prefixes of absolute cache paths for use during normalization.
     */
    protected absoluteCachePathPrefixes: string[] = ['/', '\\'];

    /**
     * Create a new Illuminate application instance.
     */
    public constructor(basePath?: string) {
        super();

        if (basePath) {
            this.setBasePath(basePath);
        }

        this.registerBaseBindings();
        this.registerBaseServiceProviders();
    }

    /**
     * Begin configuring a new Laravel application instance.
     */
    public static configure(basePath?: string): ApplicationBuilder {
        if (!basePath) {
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
        if (Deno.env.has('APP_BASE_PATH')) {
            return Deno.env.get('APP_BASE_PATH')!;
        }

        return dirname(Deno.cwd());
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
        this.register(new RoutingServiceProvider(this));
    }

    /**
     * Run the given array of bootstrap classes.
     */
    public bootstrapWith(bootstrappers: string[]): void {
        this.beenBootstrapped = true;

        for (const bootstrapper of bootstrappers) {
            this.make('events').dispatch(`bootstrapping: ${bootstrapper}`, [this]);

            this.make(bootstrapper).bootstrap(this);

            this.make('events').dispatch(`bootstrapped: ${bootstrapper}`, [this]);
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
        this.make('events').listen(`bootstrapping: ${bootstrapper}`, callback);
    }

    /**
     * Register a callback to run after a bootstrapper.
     */
    public afterBootstrapping(bootstrapper: string, callback: () => unknown): void {
        this.make('events').listen(`bootstrapped: ${bootstrapper}`, callback);
    }

    /**
     * Determine if the application has been bootstrapped before.
     */
    public hasBeenBootstrapped(): boolean {
        return this.beenBootstrapped;
    }

    /**
     * Set the base path for the application.
     */
    public setBasePath(basePath: string): this {
        this.basePath = rtrim(basePath, '\/');

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
        this.instance('path.resources', this.resourcePath());
        this.instance('path.storage', this.getStoragePath());

        this.useBootstrapPath(value(() => this.getBasePath('bootstrap')));
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
     * Get the base path of the Laravel installation.
     */
    public getBasePath(path: string = ''): string {
        return this.joinPaths(this.basePath ?? '', path);
    }

    /**
     * Get the path to the bootstrap directory.
     */
    public getBootstrapPath(path: string = ''): string {
        return this.joinPaths(this.bootstrapPath ?? '', path);
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
        return this.joinPaths(
            this.storagePath ?? Deno.env.get('LARAVEL_STORAGE_PATH') ?? this.getBasePath('storage'),
            path,
        );
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
        return this.environmentFile;
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

            return Str.is(patterns, this.make('env'));
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
        const args = this.runningInConsole() && Deno.args.length > 0 ? Deno.args : undefined;

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

        return (Array.isArray(commands[0]) ? commands[0] : commands).includes(Deno.args[0] ?? null);
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

    /**
     * Register all of the configured providers.
     */
    public registerConfiguredProviders(): void {
        const providers = new Collection(this.make('config').get('app.providers'));

        (new ProviderRepository(this, new Filesystem(), this.getCachedServicesPath()))
            .load(providers.collapse().toArray());

        this.fireAppCallbacks(this.registeredCallbacks);
    }

    /**
     * Register a service provider with the application.
     */
    public register(provider: ServiceProvider | Class<ServiceProvider>, force: boolean = false): ServiceProvider {
        const registered = this.getProvider(provider);

        if (registered && !force) {
            return registered;
        }

        // If the given "provider" is a class, we will resolve it, passing in the
        // application instance automatically for the developer. This is simply
        // a more convenient way of specifying your service provider classes.
        if (isClass(provider)) {
            provider = this.resolveProvider(provider as Class<ServiceProvider>);
        }

        provider.register();

        // If there are bindings / singletons set as properties on the provider we
        // will spin through them and register them with the application, which
        // serves as a convenience layer while registering a lot of bindings.
        for (const [key, value] of provider.bindings ?? new Map()) {
            this.bind(key, value);
        }

        for (const [key, value] of provider.singletons ?? new Map()) {
            this.singleton(key, value);
        }

        this.markAsRegistered(provider);

        // If the application has already booted, we will call this boot method on
        // the provider class so it has an opportunity to do its boot logic and
        // will be ready for any usage by this developer's application logic.
        if (this.isBooted()) {
            this.bootProvider(provider);
        }

        return provider;
    }

    /**
     * Get the registered service provider instance if it exists.
     */
    public getProvider(provider: ServiceProvider | Class<ServiceProvider>): ServiceProvider | undefined {
        const name = isClass<ServiceProvider>(provider) ? provider : provider.constructor.name;

        return this.serviceProviders.get(name);
    }

    /**
     * Get the registered service provider instances if any exist.
     */
    public getProviders(provider: ServiceProvider | Class<ServiceProvider>): ServiceProvider[] {
        const name = isClass(provider) ? provider : provider.constructor.name;

        return Arr.where(this.serviceProviders.values(), (value: ServiceProvider) => {
            if (isClass(name)) {
                return value instanceof name;
            }

            return value.constructor.name === name;
        }) as ServiceProvider[];
    }

    /**
     * Resolve a service provider instance from the class name.
     */
    public resolveProvider(provider: Class<ServiceProvider>): ServiceProvider {
        return new provider(this);
    }

    /**
     * Mark the given provider as registered.
     */
    protected markAsRegistered(provider: ServiceProvider): void {
        const className = provider.constructor.name;

        this.serviceProviders.set(className, provider);
        this.loadedProviders.set(className, true);
    }

    /**
     * Resolve the given type from the container.
     */
    public override make<TClass>(
        abstract: Abstract,
        parameters: unknown[] = [],
    ): typeof abstract extends Class ? TClass : unknown {
        return super.make(abstract, parameters);
    }

    /**
     * Resolve the given type from the container.
     */
    protected override resolve<TClass>(
        abstract: Abstract,
        parameters: unknown[] = [],
        raiseEvents: boolean = true,
    ): typeof abstract extends Class ? TClass : unknown {
        return super.resolve(abstract, parameters, raiseEvents);
    }

    /**
     * Determine if the given abstract type has been bound.
     */
    public override bound(abstract: Abstract): boolean {
        return super.bound(abstract);
    }

    /**
     * Determine if the application has booted.
     */
    public isBooted(): boolean {
        return this.hasBooted;
    }

    /**
     * Boot the application's service providers.
     */
    public boot(): void {
        if (this.isBooted()) {
            return;
        }

        // Once the application has booted we will also fire some "booted" callbacks
        // for any listeners that need to do work after this initial booting gets
        // finished. This is useful when ordering the boot-up processes we run.
        this.fireAppCallbacks(this.bootingCallbacks);

        for (const p of this.serviceProviders.values()) {
            this.bootProvider(p);
        }

        this.hasBooted = true;

        this.fireAppCallbacks(this.bootedCallbacks);
    }

    /**
     * Boot the given service provider.
     */
    protected bootProvider(provider: ServiceProvider): void {
        provider.callBootingCallbacks();

        if (Object.hasOwn(provider.constructor.prototype, 'boot')) {
            provider.boot();
        }

        provider.callBootedCallbacks();
    }

    /**
     * Register a new boot listener.
     */
    public booting(callback: () => unknown): void {
        this.bootingCallbacks.push(callback);
    }

    /**
     * Register a new "booted" listener.
     */
    public booted(callback: (application: Application) => unknown): void {
        this.bootedCallbacks.push(callback);

        if (this.isBooted()) {
            callback(this);
        }
    }

    /**
     * Call the booting callbacks for the application.
     */
    protected fireAppCallbacks(callbacks: ((application: Application) => unknown)[]): void {
        let index = 0;

        while (index < callbacks.length) {
            callbacks[index](this);

            index++;
        }
    }

    /**
     * Handle the incoming HTTP request and send the response to the browser.
     */
    public handleRequest(request: Request): void {
        const kernel = this.make(HttpKernelContract);

        const response = kernel.handle(request).send();

        kernel.terminate(request, response);
    }

    /**
     * Handle the incoming Artisan command.
     */
    public handleCommand(input: InputInterface): number {
        const kernel = this.make(ConsoleKernelContract);

        const status = kernel.handle(input, new ConsoleOutput());

        kernel.terminate(input, status);

        return status;
    }

    /**
     * Determine if the framework's base configuration should be merged.
     */
    public shouldMergeFrameworkConfiguration(): boolean {
        return this.mergeFrameworkConfiguration;
    }

    /**
     * Indicate that the framework's base configuration should not be merged.
     */
    public dontMergeFrameworkConfiguration(): this {
        this.mergeFrameworkConfiguration = false;

        return this;
    }

    /**
     * Determine if middleware has been disabled for the application.
     */
    public shouldSkipMiddleware(): boolean {
        return this.bound('middleware.disable') && this.make('middleware.disable') === true;
    }

    /**
     * Get the path to the cached services.ts file.
     */
    public getCachedServicesPath(): string {
        return this.normalizeCachePath('APP_SERVICES_CACHE', 'cache/services.ts');
    }

    /**
     * Get the path to the cached packages.ts file.
     */
    public getCachedPackagesPath(): Str {
        return this.normalizeCachePath('APP_PACKAGES_CACHE', 'cache/packages.ts');
    }

    /**
     * Determine if the application configuration is cached.
     */
    public async configurationIsCached(): Promise<boolean> {
        if (this.bound('config_loaded_from_cache')) {
            return !!this.make('config_loaded_from_cache');
        }

        return this.instance('config_loaded_from_cache', await exists(this.getCachedConfigPath(), { isFile: true }));
    }

    /**
     * Get the path to the configuration cache file.
     */
    public getCachedConfigPath(): string {
        return this.normalizeCachePath('APP_CONFIG_CACHE', 'cache/config.ts');
    }

    /**
     * Determine if the application routes are cached.
     */
    public routesAreCached(): boolean {
        if (this.bound('routes.cached')) {
            return !!this.make('routes.cached');
        }

        return this.instance('routes.cached', this.make('files').exists(this.getCachedRoutesPath()));
    }

    /**
     * Get the path to the routes cache file.
     */
    public getCachedRoutesPath(): string {
        return this.normalizeCachePath('APP_ROUTES_CACHE', 'cache/routes-v7.ts');
    }

    /**
     * Determine if the application events are cached.
     */
    public eventsAreCached(): boolean {
        if (this.bound('events.cached')) {
            return !!this.make('events.cached');
        }

        return this.instance(
            'events.cached',
            this.make('files').exists(this.getCachedEventsPath()),
        );
    }

    /**
     * Get the path to the events cache file.
     */
    public getCachedEventsPath(): string {
        return this.normalizeCachePath('APP_EVENTS_CACHE', 'cache/events.ts');
    }

    /**
     * Normalize a relative or absolute path to a cache file.
     */
    protected normalizeCachePath(key: string, defaultValue: string): string {
        const env = Env.get(key);

        if (env === null) {
            return this.getBootstrapPath(defaultValue);
        }

        return Str.startsWith(env, this.absoluteCachePathPrefixes) ? env : this.getBasePath(env);
    }

    /**
     * Add new prefix to list of absolute path prefixes.
     */
    public addAbsoluteCachePathPrefix(prefix: string): this {
        this.absoluteCachePathPrefixes.push(prefix);

        return this;
    }

    /**
     * Get an instance of the maintenance mode manager implementation.
     */
    public maintenanceMode(): MaintenanceMode {
        return this.make(MaintenanceModeContract);
    }

    /**
     * Determine if the application is currently down for maintenance.
     */
    public isDownForMaintenance(): boolean {
        return this.maintenanceMode().active();
    }

    /**
     * Throw an HttpException with the given data.
     *
     * @throws {HttpException} if code is anything other than a 404
     * @throws {NotFoundHttpException} if code is a 404
     */
    public abort(code: number, message: string = '', headers: unknown[] = []): never {
        if (code == 404) {
            throw new NotFoundHttpException(message, null, 0, headers);
        }

        throw new HttpException(code, message, null, headers);
    }

    /**
     * Register a terminating callback with the application.
     */
    public terminating(callback: () => unknown): this {
        this.terminatingCallbacks.push(callback);

        return this;
    }

    /**
     * Terminate the application.
     */
    public terminate(): void {
        let index = 0;

        while (index < this.terminatingCallbacks.length) {
            this.terminatingCallbacks[index]();

            index++;
        }
    }

    /**
     * Get the service providers that have been loaded.
     */
    public getLoadedProviders(): Map<string | Class<ServiceProvider>, boolean> {
        return this.loadedProviders;
    }

    /**
     * Determine if the given service provider is loaded.
     */
    public providerIsLoaded(provider: Class<ServiceProvider>): boolean {
        return this.loadedProviders.has(provider);
    }

    /**
     * Flush the container of all bindings and resolved instances.
     */
    public override flush(): void {
        super.flush();

        this.loadedProviders.clear();
        this.bootedCallbacks = [];
        this.bootingCallbacks = [];
        this.reboundCallbacks.clear();
        this.serviceProviders.clear();
        this.resolvingCallbacks.clear();
        this.terminatingCallbacks = [];
        this.beforeResolvingCallbacks.clear();
        this.afterResolvingCallbacks.clear();
        this.globalBeforeResolvingCallbacks = [];
        this.globalResolvingCallbacks = [];
        this.globalAfterResolvingCallbacks = [];
    }
}
