import express from 'express';
import { Container } from './Container';
import { ServiceProvider } from './ServiceProvider';

export class Application extends Container {
    public app = express();
    private providers: ServiceProvider[] = [];

    register(provider: ServiceProvider) {
        this.providers.push(provider);
    }

    async boot() {
        for (const provider of this.providers) {
            if (provider.boot) await provider.boot(this);
        }
    }

    listen(port: number) {
        this.app.listen(port);
    }
}
