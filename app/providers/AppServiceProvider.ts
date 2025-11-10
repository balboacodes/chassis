import App from '../../src/framework/App.js';
import ServiceProvider from '../../src/framework/providers/ServiceProvider.js';

export default class AppServiceProvider extends ServiceProvider {
    public register(app: App): void {}

    public boot(app: App): void {}
}
