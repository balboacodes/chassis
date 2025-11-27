import { App } from '../../src/facades/App.ts';
import { ServiceProvider } from '../../src/providers/ServiceProvider.ts';
import { Abstract } from '../../src/types.ts';

export default class AppServiceProvider extends ServiceProvider {
    public override singletons: Map<Abstract, unknown> = new Map([
        [Symbol.for('singleton'), () => 'testing'],
    ]);

    public override register(): void {
        App.bind(Symbol.for('register'), 123);
    }
}
