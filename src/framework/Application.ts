import express from 'express';
import { Express } from 'express-serve-static-core';
import { Container } from './Container.js';
import { ServiceProvider } from './providers/ServiceProvider.js';
import { ConfigServiceProvider } from './providers/ConfigServiceProvider.js';
import { LoggerServiceProvider } from './providers/LoggerServiceProvider.js';
import { Class } from './types.js';
import { RouteServiceProvider } from './providers/RouteServiceProvider.js';
import { setAppInstance } from './helpers.js';

export class Application extends Container {
    public app: Express = express();

    private providers: Class<ServiceProvider>[] = [RouteServiceProvider, ConfigServiceProvider, LoggerServiceProvider];

    public register(provider: Class<ServiceProvider>): void {
        this.providers.push(provider);
    }

    public async boot(): Promise<this> {
        for (let provider of this.providers) {
            const p = new provider();

            if (p.register) await p.register(this);
            if (p.boot) await p.boot(this);
        }

        return this;
    }

    public listen(port: number): void {
        this.app.listen(port);

        console.log('🚀 Server running at http://localhost:3000');
    }

    public static create(): Application {
        const app = new Application();

        setAppInstance(app);

        return app;
    }

    public withProviders(providers: Class[] = []): this {
        for (const provider of providers) {
            this.register(provider);
        }

        return this;
    }
}
