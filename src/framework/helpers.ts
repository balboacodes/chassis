import { Application } from './Application';

let globalApp: Application | null = null;

/**
 * Assign the global app instance.
 * Called once during bootstrap.
 */
export function setAppInstance(app: Application) {
    globalApp = app;
}

/**
 * Get the global Application container.
 */
export function app(): Application {
    if (!globalApp) {
        throw new Error('Application instance not initialized yet.');
    }
    return globalApp;
}

/**
 * Get a config value by key, e.g. config("app.port").
 */
export function config<T = any>(key: string, defaultValue?: T): T {
    const cfg = app().make<any>('config');
    return cfg.get<T>(key, defaultValue);
}

/**
 * Get a logger instance (optional convenience).
 */
export function logger() {
    return app().make<{ log: (msg: string) => void }>('logger');
}
