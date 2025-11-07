import 'reflect-metadata';
import { Application } from './framework/Application';
import { LoggerServiceProvider } from './app/providers/LoggerServiceProvider';
import { RouteServiceProvider } from './app/providers/RouteServiceProvider';
import { HomeController } from './app/Http/Controllers/HomeController';
import { ConfigServiceProvider } from './app/providers/ConfigServiceProvider';
import { ControllerServiceProvider } from './app/providers/ControllerServiceProvider';

async function bootstrap() {
    const app = new Application();

    // Register config
    const configProvider = new ConfigServiceProvider();
    await configProvider.register(app);

    // Register logger
    const loggerProvider = new LoggerServiceProvider();
    await loggerProvider.register(app);

    // Register routes
    const routeProvider = new RouteServiceProvider();
    app.register(routeProvider);

    await app.boot();

    app.listen(3000);
    console.log('🚀 Server running at http://localhost:3000');
}

bootstrap();
