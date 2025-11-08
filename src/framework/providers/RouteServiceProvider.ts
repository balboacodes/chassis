import fs from 'fs';
import path from 'path';
import Application from '../Application.js';
import ServiceProvider from './ServiceProvider.js';
import { Class, Method, Route } from '../types.js';

export default class RouteServiceProvider extends ServiceProvider {
    /**
     * @throws {Error} If config file could not be loaded.
     */
    public async boot(app: Application): Promise<void> {
        this.patchRouter(app);

        const routesDir = path.resolve(process.cwd(), 'routes');

        if (!fs.existsSync(routesDir)) {
            console.log('❗️ Routes not booted');

            return;
        }

        const files = fs.readdirSync(routesDir).filter((f) => f.endsWith('.ts') || f.endsWith('.js'));

        for (const file of files) {
            const modulePath = path.join(routesDir, file);
            const routeModule = await import(modulePath);

            if (typeof routeModule.default !== 'function') {
                throw new Error(`❗️ ${file} — no default function exported`);
            }

            routeModule.default(app);
        }

        console.log('✅ Routes booted');
    }

    private patchRouter(app: Application): void {
        const router = app.app;

        const methods: Method[] = ['get', 'post', 'put', 'patch', 'delete'];

        for (const method of methods) {
            const original = router[method].bind(router);

            ((router as any)[method] as Route) = (
                routePath: string,
                controllerOrHandler: Class | Function,
                methodName?: string,
            ): void => {
                if (!methodName && typeof controllerOrHandler !== 'function') {
                    // TODO: this throws for some Express stuff
                    // throw new Error(`❗️ Invalid route handler for path '${routePath}'`);
                    return;
                }

                let handler = controllerOrHandler;

                if (methodName) {
                    // Use container to instantiate controller with its dependencies
                    const controller: Class = app.make(controllerOrHandler as Class);
                    const method: Function | undefined = controller[methodName];

                    if (typeof method !== 'function') {
                        throw new Error(`❗️ Controller '${controllerOrHandler?.name}' has no method '${methodName}'`);
                    }

                    handler = method.bind(controller);
                }

                original(routePath, handler as any);
            };
        }
    }
}
