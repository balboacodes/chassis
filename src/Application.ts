import { load } from '@std/dotenv';
import { expandGlob } from '@std/fs';
import { route } from '@std/http/unstable-route';
import { join } from '@std/path';
import { Config } from './Config.ts';
import { Container } from './Container.ts';
import { ConfigServiceProvider } from './providers/ConfigServiceProvider.ts';
import { RouteServiceProvider } from './providers/RouteServiceProvider.ts';
import { ServiceProvider } from './providers/ServiceProvider.ts';
import { RouteRegistrar } from './routing/RouteRegistrar.ts';
import { Class } from './types.ts';

export class Application extends Container {
    /**
     * The current application instance.
     */
    public static instance: Application;

    /**
     * The base service providers to load.
     */
    protected baseServiceProviders: Class<ServiceProvider>[] = [ConfigServiceProvider, RouteServiceProvider];

    /**
     * The service providers that have been loaded.
     */
    protected loadedServiceProviders: ServiceProvider[] = [];

    /**
     * Create a new application instance.
     */
    public constructor() {
        super();
        Application.instance = this;
    }

    /**
     * Start application.
     */
    public async start(): Promise<void> {
        await this.loadEnv();
        await this.loadProviders();
        await this.registerProviders();
        await this.bootProviders();
        this.serve();
    }

    /**
     * Load .env file.
     */
    protected async loadEnv(): Promise<void> {
        await load({ export: true });
    }

    /**
     * Load service providers.
     */
    protected async loadProviders(): Promise<void> {
        for (const provider of this.baseServiceProviders) {
            this.loadedServiceProviders.push(new provider(this));
        }

        const providerFiles = await Array.fromAsync(expandGlob(join(Deno.cwd(), 'app/providers/*.ts')));

        for (const file of providerFiles) {
            const provider: ServiceProvider = new (await import(file.path)).default(this);

            this.loadedServiceProviders.push(provider);
        }
    }

    /**
     * Register service providers.
     */
    protected async registerProviders(): Promise<void> {
        for (const provider of this.loadedServiceProviders) {
            for (const [abstract, concrete] of provider.bindings) {
                this.bind(abstract, concrete);
            }

            for (const [abstract, concrete] of provider.singletons) {
                this.singleton(abstract, concrete);
            }

            await provider.register();
        }
    }

    /**
     * Boot service providers.
     */
    protected async bootProviders(): Promise<void> {
        for (const provider of this.loadedServiceProviders) {
            await provider.boot();
        }
    }

    /**
     * Start the server.
     */
    protected serve(): void {
        Deno.serve(
            {
                hostname: this.resolve<Config>(Config).get<string>('app.url'),
                port: this.resolve<Config>(Config).get<number>('app.port'),
            },
            route(
                this.resolve<RouteRegistrar>(RouteRegistrar).getRoutes(),
                () => new Response('Not found', { status: 404 }),
            ),
        );
    }
}
