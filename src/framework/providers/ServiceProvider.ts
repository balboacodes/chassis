import App from '../App.ts';
import { Class } from '../types.ts';

export default abstract class ServiceProvider {
    /**
     * All of the container bindings that should be registered.
     */
    public bindings?: Class[];

    /**
     * All of the container singletons that should be registered.
     */
    public singletons?: Class[];

    /**
     * Create a new service provider instance.
     */
    public constructor(protected app: App) {}

    /**
     * Register any application services.
     */
    public register?(): void | Promise<void>;

    /**
     * Bootstrap any application services.
     */
    public boot?(...params: any[]): void | Promise<void>;
}
