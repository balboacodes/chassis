import { load } from '@std/dotenv';
import { join } from '@std/path/windows/join';
import { Container } from './Container.ts';
import { ConfigServiceProvider } from './providers/ConfigServiceProvider.ts';
import { ServiceProvider } from './providers/ServiceProvider.ts';
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
     * Start application.
     */
    public async start(): Promise<void> {
        await this.loadEnv();
        await this.loadProviders();
        await this.registerProviders();
        await this.bootProviders();
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

        const providers: Class<ServiceProvider>[] = (await import(join(Deno.cwd(), '/bootstrap/providers.ts'))).default;

        for (const provider of providers) {
            this.loadedServiceProviders.push(new provider(this));
        }
    }

    /**
     * Register service providers.
     */
    protected async registerProviders(): Promise<void> {
        for (const provider of this.loadedServiceProviders) {
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
}
