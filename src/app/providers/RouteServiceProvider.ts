import { ServiceProvider } from '../../framework/ServiceProvider';
import { Application } from '../../framework/Application';
import fs from 'fs';
import path from 'path';

export class RouteServiceProvider extends ServiceProvider {
    register(): void {}

    async boot(app: Application) {
        this.patchRouter(app);

        const routesDir = path.resolve('src/app/Http/routes');
        if (!fs.existsSync(routesDir)) return;

        const files = fs.readdirSync(routesDir).filter((f) => f.endsWith('.ts') || f.endsWith('.js'));

        for (const file of files) {
            try {
                const modulePath = path.join(routesDir, file);
                const routeModule = await import(modulePath);

                if (typeof routeModule.registerRoutes === 'function') {
                    routeModule.registerRoutes(app);
                } else {
                    console.warn(`⚠️ Skipping ${file} — no registerRoutes function exported`);
                }
            } catch (err) {
                console.error(`❌ Failed to load route file ${file}:`, err);
            }
        }

        console.log('✅ Routes registered successfully');
    }

    private patchRouter(app: Application) {
        const router = app.app as any;
        const methods = ['get', 'post', 'put', 'patch', 'delete'];

        for (const method of methods) {
            const original = router[method].bind(router);

            router[method] = (routePath: string, ControllerOrHandler: any, methodName?: string) => {
                let handler: Function | null = null;

                if (methodName) {
                    // Use container to instantiate controller!
                    let controllerInstance: any;
                    try {
                        controllerInstance = app.make(ControllerOrHandler); // ✅ Must use container
                    } catch (err) {
                        console.warn(`⚠️ Could not instantiate controller '${ControllerOrHandler?.name}':`, err);
                        return;
                    }

                    const methodFunc = controllerInstance[methodName];
                    if (typeof methodFunc === 'function') {
                        handler = methodFunc.bind(controllerInstance);
                    } else {
                        console.warn(`⚠️ Controller '${ControllerOrHandler?.name}' has no method '${methodName}'`);
                        return;
                    }
                } else if (typeof ControllerOrHandler === 'function') {
                    handler = ControllerOrHandler;
                } else {
                    // console.warn(`⚠️ Invalid route handler for path '${routePath}'`);
                    return;
                }

                original(routePath, handler);
            };
        }
    }
}
