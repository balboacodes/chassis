import Container from '../../src/framework/Container.js';
import ServiceProvider from '../../src/framework/providers/ServiceProvider.js';

export default class AppServiceProvider extends ServiceProvider {
    public register(app: Container): void {}

    public boot(app: Container): void {}
}
