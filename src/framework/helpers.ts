import Application from './Application.js';
import Config from './Config.js';
import Log from './Log.js';

let globalApp: Application | null = null;

/**
 * Assign the global app instance. Called once during bootstrap.
 */
export function setAppInstance(app: Application): void {
    globalApp = app;

    console.log(globalApp ? '✅ App instance set' : '❗️ App instance not set');
}

/**
 * Get the global Application container.
 */
export function app(): Application {
    if (!globalApp) {
        throw new Error('❗️ Application instance not initialized yet.');
    }

    return globalApp;
}

/**
 * Get a config value by key.
 */
export function config<T = any>(key: string, defaultValue?: T): T {
    const config = app().make(Config);

    return config.get<T>(key, defaultValue);
}

/**
 * Get a Log instance.
 */
export function logger(message: string): void {
    return app().make(Log).log(message);
}
