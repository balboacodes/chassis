import { load } from '@std/dotenv';
import { expandGlob } from '@std/fs';
import { type Route as RouteType, route } from '@std/http/unstable-route';
import { join } from '@std/path';
import { Config } from './Config.ts';
import { Container } from './Container.ts';
import { ConfigServiceProvider } from './providers/ConfigServiceProvider.ts';
import { ServiceProvider } from './providers/ServiceProvider.ts';
import { Route } from './Route.ts';
import { Class } from './types.ts';

export class Application extends Container {
    /**
     * The base service providers to load.
     */
    protected baseServiceProviders: Class<ServiceProvider>[] = [ConfigServiceProvider];

    /**
     * The service providers that have been loaded.
     */
    protected loadedServiceProviders: ServiceProvider[] = [];

    /**
     * The routes that have been loaded.
     */
    protected loadedRoutes: RouteType[] = [];

    /**
     * Start application.
     */
    public async start(): Promise<void> {
        await this.loadEnv();
        await this.loadProviders();
        await this.registerProviders();
        await this.bootProviders();
        await this.loadRoutes();
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
            const provider: Class<ServiceProvider> = (await import(file.path)).default;

            this.loadedServiceProviders.push(new provider(this));
        }
    }

    /**
     * Register service providers.
     */
    protected async registerProviders(): Promise<void> {
        for (const provider of this.loadedServiceProviders) {
            await provider.register();

            for (const [abstract, concrete] of provider.bindings) {
                this.bind(abstract, concrete);
            }

            for (const [abstract, concrete] of provider.singletons) {
                this.singleton(abstract, concrete);
            }
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
     * Load routes.
     */
    protected async loadRoutes(): Promise<void> {
        const routes: () => void = (await import(join(Deno.cwd(), 'routes/web.ts'))).default;
        routes();

        this.loadedRoutes = Route.routes;
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
            route(this.loadedRoutes, () => new Response('Not found', { status: 404 })),
        );
    }
}
