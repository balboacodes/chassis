import { ServiceProvider } from '../../src/providers/ServiceProvider.ts';
import { Abstract } from '../../src/types.ts';

export default class AppServiceProvider extends ServiceProvider {
    public override singletons: Map<Abstract, unknown> = new Map([
        [Symbol.for('appserviceprovidersingleton'), () => 'testing'],
    ]);

    public override register(): void {
        this.app.bind(Symbol.for('appserviceprovider'), 123);
    }
}
