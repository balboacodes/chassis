import { expandGlob } from '@std/fs/expand-glob';
import { join } from '@std/path/join';
import { App } from '../facades/App.ts';
import { Class } from '../types.ts';
import { ConfigServiceProvider } from './ConfigServiceProvider.ts';
import { RouteServiceProvider } from './RouteServiceProvider.ts';
import { ServiceProvider } from './ServiceProvider.ts';

export class AppServiceProvider extends ServiceProvider {
    /**
     * The service providers to load.
     */
    protected serviceProviders: Class<ServiceProvider>[] = [ConfigServiceProvider, RouteServiceProvider];

    /**
     * The service providers that have been loaded.
     */
    protected loadedServiceProviders: ServiceProvider[] = [];

    /**
     * @inheritdoc
     */
    public override async register(): Promise<void> {
        await this.loadProviders();

        for (const provider of this.loadedServiceProviders) {
            for (const [abstract, concrete] of provider.bindings) {
                App.bind(abstract, concrete);
            }

            for (const [abstract, concrete] of provider.singletons) {
                App.singleton(abstract, concrete);
            }

            await provider.register();
        }
    }

    /**
     * @inheritdoc
     */
    public override async boot(): Promise<void> {
        for (const provider of this.loadedServiceProviders) {
            await provider.boot();
        }
    }

    /**
     * Load the service providers.
     */
    protected async loadProviders(): Promise<void> {
        const path = join(Deno.cwd(), 'app/providers/*.ts');
        const files = await Array.fromAsync(expandGlob(path));

        for (const file of files) {
            const provider = await import(file.path);
            this.serviceProviders.push(provider.default);
        }

        for (const provider of this.serviceProviders) {
            this.loadedServiceProviders.push(new provider());
        }
    }
}
