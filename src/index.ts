import 'reflect-metadata';
import { Application } from './framework/Application.js';
import { ConfigServiceProvider } from './framework/providers/ConfigServiceProvider.js';
import { LoggerServiceProvider } from './framework/providers/LoggerServiceProvider.js';
import { RouteServiceProvider } from './framework/providers/RouteServiceProvider.js';
import { setAppInstance } from './framework/helpers.js';

(async () => {
    const app = new Application();
    setAppInstance(app);

    // Register config
    const configProvider = new ConfigServiceProvider();
    await configProvider.register(app);

    console.log('✅ Config registered successfully');

    // Register logger
    const loggerProvider = new LoggerServiceProvider();
    await loggerProvider.register(app);

    console.log('✅ Logger registered successfully');

    // Register routes
    const routeProvider = new RouteServiceProvider();
    app.register(routeProvider);

    console.log('✅ Routes registered successfully');

    await app.boot();

    app.listen(3000);

    console.log('🚀 Server running at http://localhost:3000');
})();
