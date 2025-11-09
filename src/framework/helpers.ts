import Application from './Application.js';
import Config from './Config.js';
import { Class } from './types.js';

let globalApp: Application | null = null;

/**
 * Assign the global app instance. Called once during bootstrap.
 */
export function setAppInstance(app: Application): void {
    globalApp = app;
    console.log(globalApp ? '✅ App instance set' : '❗️ App instance not set');
}

/**
 * Get the available application instance.
 *
 * @throws {Error} If application instance has not been initialized.
 */
export function app(abstract?: Class): Class | Application {
    if (!globalApp) {
        throw new Error('❗️ Application instance not initialized yet.');
    }

    if (abstract === undefined) {
        return globalApp as any;
    }

    return globalApp.make(abstract) as any;
}

/**
 * Get / set the specified configuration value.
 *
 * If an object is passed as the key, we will assume you want to set an object of values.
 */
export function config(key?: string | Record<string, any>, defaultValue?: any): any {
    const repository = app(Config) as Class<Config>;

    if (key === undefined) {
        return repository as any;
    }

    if (typeof key === 'string') {
        return repository.get(key, defaultValue);
    }

    return repository.set(key);
}
