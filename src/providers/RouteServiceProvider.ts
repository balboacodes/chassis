import { join } from '@std/path/join';
import { Route } from '../routing/Route.ts';
import { RouteRegistrar } from '../routing/RouteRegistrar.ts';
import { Abstract } from '../types.ts';
import { ServiceProvider } from './ServiceProvider.ts';

export class RouteServiceProvider extends ServiceProvider {
    /**
     * @inheritdoc
     */
    public override bindings: Map<Abstract, unknown> = new Map([
        ['chassis.route', () => new Route()],
    ]);

    /**
     * @inheritdoc
     */
    public override singletons: Map<Abstract, unknown> = new Map([
        ['chassis.route-registrar', RouteRegistrar],
    ]);

    /**
     * @inheritdoc
     */
    public override async register(): Promise<void> {
        const path = join(Deno.cwd(), '/routes/web.ts');
        (await import(path)).default();
    }
}
