import fs from 'fs';
import path from 'path';
import { app } from '../support/helpers.js';
import { Class, Method, RouteHandler } from '../types.js';
import ServiceProvider from './ServiceProvider.js';

export default class RouteServiceProvider extends ServiceProvider {
    /**
     * @throws {Error} If routes file could not be loaded or routes file does not contain a default export.
     */
    public async boot(): Promise<void> {
        this.patchRouter();

        const routesDir = path.resolve(process.cwd(), 'routes');

        if (!fs.existsSync(routesDir)) {
            throw new Error('❗️ Routes directory not found');
        }

        const files = fs.readdirSync(routesDir).filter((f) => f.endsWith('.ts') || f.endsWith('.js'));

        for (const file of files) {
            const modulePath = path.join(routesDir, file);
            const routeModule = await import(modulePath);

            if (typeof routeModule.default !== 'function') {
                throw new Error(`❗️ ${file}: no default function exported`);
            }

            routeModule.default();
        }
    }

    /**
     * @throws {Error} If controller does not have a corresponding method.
     */
    private patchRouter(): void {
        const methods: Method[] = ['get', 'post', 'put', 'patch', 'delete'];

        for (const method of methods) {
            const original = app('router')[method].bind(app('router'));

            ((app('router') as any)[method] as RouteHandler) = (
                routePath: string,
                controllerOrHandler: Class | Function,
                methodName?: string,
            ): void => {
                if (routePath === 'etag fn') {
                    original(routePath);
                    return;
                }

                let handler = controllerOrHandler;

                if (methodName) {
                    // Use container to instantiate controller with its dependencies
                    const controller: Class = app(controllerOrHandler as Class);
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
