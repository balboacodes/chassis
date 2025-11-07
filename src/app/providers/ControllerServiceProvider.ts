import { ServiceProvider } from '../../framework/ServiceProvider';
import { Container } from '../../framework/Container';
import fs from 'fs';
import path from 'path';

export class ControllerServiceProvider extends ServiceProvider {
    async register(app: Container) {
        const controllersPath = path.resolve('src/app/Http/Controllers');

        if (!fs.existsSync(controllersPath)) return;

        const files = fs.readdirSync(controllersPath).filter((f) => f.endsWith('.ts') || f.endsWith('.js'));

        for (const file of files) {
            const modulePath = path.join(controllersPath, file);
            const controllerModule = await import(modulePath);

            // Use default export if available, otherwise first export
            const ControllerClass = controllerModule.default || Object.values(controllerModule)[0];

            if (!ControllerClass) continue;

            // Bind to container with optional dependency injection
            app.bind(ControllerClass.name, (c) => {
                return new ControllerClass();
            });
        }

        console.log('✅ Controllers registered successfully');
    }
}
