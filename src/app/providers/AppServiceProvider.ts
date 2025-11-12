import { ServiceProvider } from '../../framework/index.ts';

export default class AppServiceProvider extends ServiceProvider {
    public register(): void | Promise<void> {}

    public boot(): void | Promise<void> {}
}
