import express from 'express';
import { Express } from 'express-serve-static-core';
import { Container } from './Container.js';
import { ServiceProvider } from './providers/ServiceProvider.js';

export class Application extends Container {
    public app: Express = express();

    private providers: ServiceProvider[] = [];

    public register(provider: ServiceProvider): void {
        this.providers.push(provider);
    }

    public async boot(): Promise<void> {
        for (const provider of this.providers) {
            if (provider.boot) await provider.boot(this);
        }
    }

    public listen(port: number): void {
        this.app.listen(port);
    }
}
