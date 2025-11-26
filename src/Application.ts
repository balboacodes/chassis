import { load } from '@std/dotenv';
import { route } from '@std/http/unstable-route';
import { Config } from './Config.ts';
import { Container } from './Container.ts';
import { Middleware } from './middleware/Middleware.ts';
import { AppServiceProvider } from './providers/AppServiceProvider.ts';
import { RouteRegistrar } from './routing/RouteRegistrar.ts';
import { Class } from './types.ts';

export class Application extends Container {
    /**
     * The current application instance.
     */
    public static instance: Application;

    /**
     * The global middleware.
     */
    public middleware: Class<Middleware>[] = [];

    /**
     * Create a new application instance.
     */
    public constructor() {
        super();
        Application.instance = this;
    }

    /**
     * Set the global middleware.
     */
    public withMiddleware(middleware: Class<Middleware>[]): this {
        this.middleware.push(...middleware);
        return this;
    }

    /**
     * Start application.
     */
    public async start(): Promise<void> {
        await this.loadEnv();
        await this.loadProviders();
        this.serve();
    }

    /**
     * Load .env file.
     */
    protected async loadEnv(): Promise<void> {
        await load({ export: true });
    }

    /**
     * Register and boot the service providers.
     */
    protected async loadProviders(): Promise<void> {
        const provider = new AppServiceProvider(this);
        await provider.register();
        await provider.boot();
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
                this.resolve<RouteRegistrar>(RouteRegistrar).getRoutesValues(),
                () => new Response('Not found', { status: 404 }),
            ),
        );
    }
}
