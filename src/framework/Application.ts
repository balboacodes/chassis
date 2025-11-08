import express from 'express';
import { Express } from 'express-serve-static-core';
import Container from './Container.js';
import ServiceProvider from './providers/ServiceProvider.js';
import ConfigServiceProvider from './providers/ConfigServiceProvider.js';
import LoggerServiceProvider from './providers/LoggerServiceProvider.js';
import { Class } from './types.js';
import RouteServiceProvider from './providers/RouteServiceProvider.js';
import { setAppInstance } from './helpers.js';

export default class Application extends Container {
    public app: Express = express();

    private providers: Class<ServiceProvider>[] = [ConfigServiceProvider, LoggerServiceProvider, RouteServiceProvider];

    public register(provider: Class<ServiceProvider>): void {
        this.providers.push(provider);
    }

    public withProviders(providers: Class<ServiceProvider>[] = []): this {
        for (const provider of providers) {
            this.register(provider);
        }

        return this;
    }

    public async boot(): Promise<this> {
        setAppInstance(this);

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
}
