import Application from '../../src/framework/Application.js';
import ServiceProvider from '../../src/framework/providers/ServiceProvider.js';

export default class AppServiceProvider extends ServiceProvider {
    public register(app: Application): void {}

    public boot(app: Application): void {}
}
