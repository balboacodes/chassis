import { load } from '@std/dotenv';
import { route } from '@std/http/unstable-route';
import { Container } from './Container.ts';
import { Config } from './facades/Config.ts';
import { Middleware } from './middleware/Middleware.ts';
import { SetPreviousUrl } from './middleware/SetPreviousUrl.ts';
import { AppServiceProvider } from './providers/AppServiceProvider.ts';
import { RouteRegistrar } from './routing/RouteRegistrar.ts';
import { Class } from './types.ts';

export class App extends Container {
    /**
     * The current app instance.
     */
    protected static instance: App;

    /**
     * The app's global middleware.
     */
    protected middleware: Class<Middleware>[] = [SetPreviousUrl];

    /**
     * Get the app instance.
     */
    public static getInstance(): App {
        return App.instance;
    }

    /**
     * Get the app's global middleware.
     */
    public getMiddleware(): Class<Middleware>[] {
        return this.middleware;
    }

    /**
     * Set the app's global middleware.
     */
    public withMiddleware(middleware: Class<Middleware>[]): this {
        this.middleware.push(...middleware);
        return this;
    }

    /**
     * Start the app.
     */
    public async start(): Promise<void> {
        this.singleton('chassis.app', this);
        App.instance = this;

        await this.loadEnv();
        await this.loadProviders();

        this.serve();
    }

    /**
     * Load the .env file.
     */
    protected async loadEnv(): Promise<void> {
        await load({ export: true });
    }

    /**
     * Register and boot the service providers.
     */
    protected async loadProviders(): Promise<void> {
        const provider = new AppServiceProvider();
        await provider.register();
        await provider.boot();
    }

    /**
     * Start the server.
     */
    protected serve(): void {
        Deno.serve(
            { hostname: Config.get<string>('app.hostname'), port: Config.get<number>('app.port') },
            route(
                this.resolve<RouteRegistrar>('chassis.route-registrar').getRoutesValues(),
                () => new Response('Not found', { status: 404 }),
            ),
        );
    }
}
