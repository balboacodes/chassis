import fs from 'node:fs';
import path from 'node:path';
import ServiceProvider from './ServiceProvider.ts';

export default class RouteServiceProvider extends ServiceProvider {
    /**
     * @throws {Error} If routes file does not contain a default export.
     */

    public async boot(): Promise<void> {
        const routesDir = path.resolve(process.cwd(), 'routes');

        if (!fs.existsSync(routesDir)) return;

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
}
