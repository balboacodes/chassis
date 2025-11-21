import { isClass } from '@balboacodes/chassis';
import { rtrim } from '@balboacodes/php-utils';
import '@std/dotenv/load';
import { exists } from '@std/fs';
import { SEPARATOR } from '@std/path';
import Container from '../container/Container.ts';
import { Kernel as ConsoleKernelContract } from '../contracts/console/Kernel.ts';
import { default as ApplicationContract } from '../contracts/foundation/Application.ts';
import CachesConfiguration from '../contracts/foundation/CachesConfiguration.ts';
import CachesRoutes from '../contracts/foundation/CachesRoutes.ts';
import { MaintenanceMode, MaintenanceMode as MaintenanceModeSymbol } from '../contracts/foundation/MaintenanceMode.ts';
import { Kernel as KernelSymbol } from '../contracts/http/Kernel.ts';
import HttpKernelInterface from '../contracts/symfony/HttpKernelInterface.ts';
import InputInterface from '../contracts/symfony/InputInterface.ts';
import EventServiceProvider from '../events/EventServiceProvider.ts';
import { join_paths } from '../filesystem/functions.ts';
import Request from '../http/Request.ts';
import LogServiceProvider from '../log/LogServiceProvider.ts';
import ContextServiceProvider from '../log/context/ContextServiceProvider.ts';
import RoutingServiceProvider from '../routing/RoutingServiceProvider.ts';
import Arr from '../support/Arr.ts';
import Collection from '../support/Collection.ts';
import Env from '../support/Env.ts';
import ServiceProvider from '../support/ServiceProvider.ts';
import Str from '../support/Str.ts';
import { value } from '../support/helpers.ts';
import ConsoleOutput from '../symfony/ConsoleOutput.ts';
import HttpException from '../symfony/HttpException.ts';
import NotFoundHttpException from '../symfony/NotFoundHttpException.ts';
import { default as SymfonyRequest } from '../symfony/Request.ts';
import { default as SymfonyResponse } from '../symfony/Response.ts';
import { Class } from '../types.ts';
import AliasLoader from './AliasLoader.ts';
import EnvironmentDetector from './EnvironmentDetector.ts';
import ProviderRepository from './ProviderRepository.ts';
import LoadEnvironmentVariables from './bootstrap/LoadEnvironmentVariables.ts';
import ApplicationBuilder from './configuration/ApplicationBuilder.ts';
import Filesystem from './filesystem/Filesystem.ts';

export default class Application extends Container
    implements ApplicationContract, CachesConfiguration, CachesRoutes, HttpKernelInterface {
    // use Macroable;

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
    protected hasBooted: boolean = false;

    /**
     * The array of booting callbacks.
     */
    protected bootingCallbacks: (() => unknown)[] = [];

    /**
     * The array of booted callbacks.
     */
    protected bootedCallbacks: ((application?: Application) => unknown)[] = [];

    /**
     * The array of terminating callbacks.
     */
    protected terminatingCallbacks: (() => unknown)[] = [];

    /**
     * All of the registered service providers.
     */
    protected serviceProviders: Map<string | Class<ServiceProvider> | symbol, ServiceProvider> = new Map();

    /**
     * The names of the loaded service providers.
     */
    protected loadedProviders: Map<string | Class<ServiceProvider> | symbol, boolean> = new Map();

    /**
     * The deferred services and their providers.
     */
    protected deferredServices: Map<string | Class<ServiceProvider> | symbol, Class<ServiceProvider>> = new Map();

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
    protected absoluteCachePathPrefixes: string[] = ['/', '\\'];

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
        this.instance('path.resources', this.resourcePath());
        this.instance('path.storage', this.getStoragePath());

        this.useBootstrapPath(value(() => this.getBasePath('bootstrap')));
        this.useLangPath(value(() => this.resourcePath('lang')));
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
     * Get the path to the language files.
     */
    public getLangPath(path: string = ''): string {
        return this.joinPaths(this.langPath ?? '', path);
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
        const args = this.runningInConsole() && Deno.args ? Deno.args : undefined;

        this.bind('env', () => new EnvironmentDetector().detect(callback, args));

        return this.make('env') as string;
    }

    /**
     * Determine if the application is running in the console.
     */
    public runningInConsole(): boolean {
        if (this.isRunningInConsole === undefined) {
            this.isRunningInConsole =
                (Env.get('APP_RUNNING_IN_CONSOLE') ?? Deno.env.get('TERM') !== undefined) as boolean;
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
        // @ts-expect-error: need better typing
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
        // @ts-expect-error: need better typing
        const providers = new Collection(this.make('config').get('app.providers'));

        (new ProviderRepository(this, new Filesystem(), this.getCachedServicesPath())).load(
            providers.collapse().toArray() as unknown[],
        );

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
            provider = this.resolveProvider(provider);
        }

        provider.register();

        // If there are bindings / singletons set as properties on the provider we
        // will spin through them and register them with the application, which
        // serves as a convenience layer while registering a lot of bindings.
        for (const [key, value] of provider.bindings?.entries() ?? []) {
            this.bind(key, value);
        }

        for (const [key, value] of provider.singletons?.entries() ?? []) {
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
        const name = isClass(provider) ? provider : provider.constructor.name;

        return this.serviceProviders.get(name);
    }

    /**
     * Get the registered service provider instances if any exist.
     */
    public getProviders(provider: Class<ServiceProvider>): ServiceProvider[] {
        return Arr.where(this.serviceProviders.values(), (value) => value instanceof provider) as ServiceProvider[];
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
     * Load and boot all of the remaining deferred providers.
     */
    public loadDeferredProviders(): void {
        // We will simply spin through each of the deferred providers and register each
        // one and boot them if the application has booted. This should make each of
        // the remaining services available to this application for immediate use.
        for (const [service, _provider] of this.deferredServices.entries()) {
            this.loadDeferredProvider(service);
        }

        this.deferredServices.clear();
    }

    /**
     * Load the provider for a deferred service.
     */
    public loadDeferredProvider(service: string | Class<ServiceProvider> | symbol): void {
        if (!this.isDeferredService(service)) {
            return;
        }

        const provider = this.deferredServices.get(service);

        if (provider) {
            // If the service provider has not already been loaded and registered we can
            // register it with the application and remove the service from this list
            // of deferred services, since it will already be loaded on subsequent.
            if (!this.loadedProviders.get(provider.constructor.name)) {
                this.registerDeferredProvider(provider, service);
            }
        }
    }

    /**
     * Register a deferred provider and service.
     */
    public registerDeferredProvider(
        provider: Class<ServiceProvider>,
        service?: string | Class<ServiceProvider> | symbol,
    ): void {
        // Once the provider that provides the deferred service has been registered we
        // will remove it from our local list of the deferred services with related
        // providers so that this container does not try to resolve it out again.
        if (service) {
            this.deferredServices.delete(service);
        }

        const instance = new provider(this);

        this.register(instance);

        if (!this.isBooted()) {
            this.booting(() => {
                this.bootProvider(instance);
            });
        }
    }

    /**
     * Resolve the given type from the container.
     */
    public override make<TClass extends string | Class<ServiceProvider> | symbol>(
        abstract: TClass,
        parameters: unknown[] = [],
    ): TClass extends Class<ServiceProvider> ? InstanceType<TClass> : unknown {
        abstract = this.getAlias(abstract) as TClass;

        this.loadDeferredProviderIfNeeded(abstract);

        // @ts-expect-error: need better typing
        return super.make(abstract, parameters);
    }

    /**
     * Resolve the given type from the container.
     */
    protected override resolve<TClass extends string | Class<ServiceProvider> | symbol>(
        abstract: TClass,
        parameters: unknown[] = [],
        raiseEvents: boolean = true,
    ): TClass extends Class<ServiceProvider> ? InstanceType<TClass> : unknown {
        abstract = this.getAlias(abstract) as TClass;

        this.loadDeferredProviderIfNeeded(abstract);

        // @ts-expect-error: need better typing
        return super.resolve(abstract, parameters, raiseEvents);
    }

    /**
     * Load the deferred provider if the given type is a deferred service and the instance has not been loaded.
     */
    protected loadDeferredProviderIfNeeded(abstract: string | Class<ServiceProvider> | symbol): void {
        if (this.isDeferredService(abstract) && !this.instances.has(abstract)) {
            this.loadDeferredProvider(abstract);
        }
    }

    /**
     * Determine if the given abstract type has been bound.
     */
    public override bound(abstract: string | Class<ServiceProvider> | symbol): boolean {
        return this.isDeferredService(abstract) || super.bound(abstract);
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

        for (const p of Object.values(this.serviceProviders)) {
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

        provider.boot();

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
    public booted(callback: (application?: Application) => unknown): void {
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
     * {@inheritdoc}
     */
    public handle(request: SymfonyRequest): SymfonyResponse {
        // @ts-expect-error: need better typing
        return this.make(KernelSymbol).handle(Request.createFromBase(request));
    }

    /**
     * Handle the incoming HTTP request and send the response to the browser.
     */
    public handleRequest(request: Request): void {
        const kernel = this.make(KernelSymbol);

        // @ts-expect-error: need better typing
        const response = kernel.handle(request).send();
        // @ts-expect-error: need better typing
        kernel.terminate(request, response);
    }

    /**
     * Handle the incoming Artisan command.
     */
    public handleCommand(input: InputInterface): number {
        const kernel = this.make(ConsoleKernelContract);
        // @ts-expect-error: need better typing
        const status = kernel.handle(input, new ConsoleOutput());
        // @ts-expect-error: need better typing
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
    public getCachedPackagesPath(): string {
        return this.normalizeCachePath('APP_PACKAGES_CACHE', 'cache/packages.ts');
    }

    /**
     * Determine if the application configuration is cached.
     */
    public async configurationIsCached(): Promise<boolean> {
        if (this.bound('config_loaded_from_cache')) {
            return !!this.make('config_loaded_from_cache');
        }

        return this.instance(
            'config_loaded_from_cache',
            await exists(this.getCachedConfigPath(), { isFile: true }),
        ) as boolean;
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

        // @ts-expect-error: need better typing
        return this.instance('routes.cached', this.make('files').exists(this.getCachedRoutesPath())) as boolean;
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

        // @ts-expect-error: need better typing
        return this.instance('events.cached', this.make('files').exists(this.getCachedEventsPath())) as boolean;
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
        const env = Env.get(key) as string;

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
        return this.make(MaintenanceModeSymbol) as MaintenanceMode;
    }

    /**
     * Determine if the application is currently down for maintenance.
     */
    public isDownForMaintenance(): boolean {
        return this.maintenanceMode().active();
    }

    /**
     * Throw an HttpException with the given data.
     */
    public abort(code: number, message: string = '', headers: unknown[] = []): never {
        if (code == 404) {
            throw new NotFoundHttpException(message, undefined, 0, headers);
        }

        throw new HttpException(code, message, undefined, headers);
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
    public getLoadedProviders(): Map<string | Class<ServiceProvider> | symbol, boolean> {
        return this.loadedProviders;
    }

    /**
     * Determine if the given service provider is loaded.
     */
    public providerIsLoaded(provider: string): boolean {
        return !!this.loadedProviders.get(provider);
    }

    /**
     * Get the application's deferred services.
     */
    public getDeferredServices(): Map<string | Class<ServiceProvider> | symbol, Class<ServiceProvider>> {
        return this.deferredServices;
    }

    /**
     * Set the application's deferred services.
     */
    public setDeferredServices(services: Map<string | Class<ServiceProvider> | symbol, Class<ServiceProvider>>): void {
        this.deferredServices = services;
    }

    /**
     * Determine if the given service is a deferred service.
     */
    public isDeferredService(service: string | Class<ServiceProvider> | symbol): boolean {
        return this.deferredServices.has(service);
    }

    /**
     * Add a map of services to the application's deferred services.
     */
    public addDeferredServices(services: Map<string | Class<ServiceProvider> | symbol, Class<ServiceProvider>>): void {
        for (const [service, provider] of services.entries()) {
            this.deferredServices.set(service, provider);
        }
    }

    /**
     * Remove an array of services from the application's deferred services.
     */
    public removeDeferredServices(
        services: Map<string | Class<ServiceProvider> | symbol, Class<ServiceProvider>>,
    ): void {
        for (const service of services.keys()) {
            this.deferredServices.delete(service);
        }
    }

    /**
     * Configure the real-time facade namespace.
     */
    public provideFacades(namespace: string): void {
        AliasLoader.setFacadeNamespace(namespace);
    }

    /**
     * Get the current application locale.
     */
    public getLocale(): string {
        // @ts-expect-error: need better typing
        return this.make('config').get('app.locale');
    }

    /**
     * Get the current application locale.
     */
    public currentLocale(): string {
        return this.getLocale();
    }

    /**
     * Get the current application fallback locale.
     */
    public getFallbackLocale(): string {
        // @ts-expect-error: need better typing
        return this.make('config').get('app.fallback_locale');
    }

    /**
     * Set the current application locale.
     */
    public setLocale(locale: string): void {
        // @ts-expect-error: need better typing
        this.make('config').set('app.locale', locale);
        // @ts-expect-error: need better typing
        this.make('translator').setLocale(locale);
        // @ts-expect-error: need better typing
        this.make('events').dispatch(new LocaleUpdated(locale));
    }

    /**
     * Set the current application fallback locale.
     */
    public setFallbackLocale(fallbackLocale: string): void {
        // @ts-expect-error: need better typing
        this.make('config').set('app.fallback_locale', fallbackLocale);
        // @ts-expect-error: need better typing
        this.make('translator').setFallback(fallbackLocale);
    }

    /**
     * Determine if the application locale is the given locale.
     */
    public isLocale(locale: string): boolean {
        return this.getLocale() == locale;
    }

    /**
     * Register the core class aliases in the container.
     */
    public registerCoreContainerAliases(): void {
        for (
            const [key, aliases] of Object.entries({
                // 'app' => [self::class, \Illuminate\Contracts\Container\Container::class, \Illuminate\Contracts\Foundation\Application::class, \Psr\Container\ContainerInterface::class],
                // 'auth' => [\Illuminate\Auth\AuthManager::class, \Illuminate\Contracts\Auth\Factory::class],
                // 'auth.driver' => [\Illuminate\Contracts\Auth\Guard::class],
                // 'auth.password' => [\Illuminate\Auth\Passwords\PasswordBrokerManager::class, \Illuminate\Contracts\Auth\PasswordBrokerFactory::class],
                // 'auth.password.broker' => [\Illuminate\Auth\Passwords\PasswordBroker::class, \Illuminate\Contracts\Auth\PasswordBroker::class],
                // 'blade.compiler' => [\Illuminate\View\Compilers\BladeCompiler::class],
                // 'cache' => [\Illuminate\Cache\CacheManager::class, \Illuminate\Contracts\Cache\Factory::class],
                // 'cache.store' => [\Illuminate\Cache\Repository::class, \Illuminate\Contracts\Cache\Repository::class, \Psr\SimpleCache\CacheInterface::class],
                // 'cache.psr6' => [\Symfony\Component\Cache\Adapter\Psr16Adapter::class, \Symfony\Component\Cache\Adapter\AdapterInterface::class, \Psr\Cache\CacheItemPoolInterface::class],
                // 'config' => [\Illuminate\Config\Repository::class, \Illuminate\Contracts\Config\Repository::class],
                // 'cookie' => [\Illuminate\Cookie\CookieJar::class, \Illuminate\Contracts\Cookie\Factory::class, \Illuminate\Contracts\Cookie\QueueingFactory::class],
                // 'db' => [\Illuminate\Database\DatabaseManager::class, \Illuminate\Database\ConnectionResolverInterface::class],
                // 'db.connection' => [\Illuminate\Database\Connection::class, \Illuminate\Database\ConnectionInterface::class],
                // 'db.schema' => [\Illuminate\Database\Schema\Builder::class],
                // 'encrypter' => [\Illuminate\Encryption\Encrypter::class, \Illuminate\Contracts\Encryption\Encrypter::class, \Illuminate\Contracts\Encryption\StringEncrypter::class],
                // 'events' => [\Illuminate\Events\Dispatcher::class, \Illuminate\Contracts\Events\Dispatcher::class],
                // 'files' => [\Illuminate\Filesystem\Filesystem::class],
                // 'filesystem' => [\Illuminate\Filesystem\FilesystemManager::class, \Illuminate\Contracts\Filesystem\Factory::class],
                // 'filesystem.disk' => [\Illuminate\Contracts\Filesystem\Filesystem::class],
                // 'filesystem.cloud' => [\Illuminate\Contracts\Filesystem\Cloud::class],
                // 'hash' => [\Illuminate\Hashing\HashManager::class],
                // 'hash.driver' => [\Illuminate\Contracts\Hashing\Hasher::class],
                // 'log' => [\Illuminate\Log\LogManager::class, \Psr\Log\LoggerInterface::class],
                // 'mail.manager' => [\Illuminate\Mail\MailManager::class, \Illuminate\Contracts\Mail\Factory::class],
                // 'mailer' => [\Illuminate\Mail\Mailer::class, \Illuminate\Contracts\Mail\Mailer::class, \Illuminate\Contracts\Mail\MailQueue::class],
                // 'queue' => [\Illuminate\Queue\QueueManager::class, \Illuminate\Contracts\Queue\Factory::class, \Illuminate\Contracts\Queue\Monitor::class],
                // 'queue.connection' => [\Illuminate\Contracts\Queue\Queue::class],
                // 'queue.failer' => [\Illuminate\Queue\Failed\FailedJobProviderInterface::class],
                // 'redirect' => [\Illuminate\Routing\Redirector::class],
                // 'redis' => [\Illuminate\Redis\RedisManager::class, \Illuminate\Contracts\Redis\Factory::class],
                // 'redis.connection' => [\Illuminate\Redis\Connections\Connection::class, \Illuminate\Contracts\Redis\Connection::class],
                // 'request' => [\Illuminate\Http\Request::class, \Symfony\Component\HttpFoundation\Request::class],
                // 'router' => [\Illuminate\Routing\Router::class, \Illuminate\Contracts\Routing\Registrar::class, \Illuminate\Contracts\Routing\BindingRegistrar::class],
                // 'session' => [\Illuminate\Session\SessionManager::class],
                // 'session.store' => [\Illuminate\Session\Store::class, \Illuminate\Contracts\Session\Session::class],
                // 'translator' => [\Illuminate\Translation\Translator::class, \Illuminate\Contracts\Translation\Translator::class],
                // 'url' => [\Illuminate\Routing\UrlGenerator::class, \Illuminate\Contracts\Routing\UrlGenerator::class],
                // 'validator' => [\Illuminate\Validation\Factory::class, \Illuminate\Contracts\Validation\Factory::class],
                // 'view' => [\Illuminate\View\Factory::class, \Illuminate\Contracts\View\Factory::class],
            })
        ) {
            for (const alias of aliases as Class[]) {
                this.alias(key, alias);
            }
        }
    }

    /**
     * Flush the container of all bindings and resolved instances.
     */
    public override flush(): void {
        super.flush();

        this.loadedProviders.clear();
        this.bootedCallbacks = [];
        this.bootingCallbacks = [];
        this.deferredServices.clear();
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
