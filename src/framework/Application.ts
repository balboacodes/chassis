import express from 'express';
import fs from 'fs';
import path from 'node:path';
import { loadEnvFile } from 'node:process';
import Container from './Container.js';
import ConfigServiceProvider from './providers/ConfigServiceProvider.js';
import RouteServiceProvider from './providers/RouteServiceProvider.js';

export default class Application extends Container {
    public router = express();

    private providers = new Set([ConfigServiceProvider, RouteServiceProvider]);

    public async boot(): Promise<void> {
        this.loadEnv();

        Container.setInstance(this);
        console.log(Container.getInstance() === this ? '✅ App instance set' : '❗️ App instance not set');

        await this.bootProviders();

        this.bootMiddleware();

        this.listen();
    }

    private loadEnv(): void {
        loadEnvFile();
        console.log(process.env.APP_NAME ? '✅ .env loaded' : '❗️ .env not loaded');
    }

    private async bootProviders(): Promise<void> {
        await this.loadProviders();

        for (let provider of this.providers) {
            const p = new provider();

            if (p.register) await p.register(this);
            if (p.boot) await p.boot(this);
        }

        console.log('✅ Service providers booted');
    }

    private async loadProviders(): Promise<void> {
        const providersDir = path.resolve(process.cwd(), 'app/providers');

        if (!fs.existsSync(providersDir)) {
            return;
        }

        const files = fs.readdirSync(providersDir).filter((f) => f.endsWith('.ts') || f.endsWith('.js'));

        for (const file of files) {
            const modulePath = path.join(providersDir, file);
            const providerModule = await import(modulePath);

            if (typeof providerModule.default !== 'function') {
                throw new Error(`❗️ ${file} — no default class exported`);
            }

            this.providers.add(providerModule.default);
        }
    }

    private bootMiddleware(): void {
        this.router.use((req, _res, next) => {
            this.bind('request', () => req);
            next();
        });
    }

    private listen(): void {
        const port = process.env.NODE_ENV === 'development' ? 3000 : 443;
        const server = this.router.listen(port);
        console.log(server.listening ? `🚀 Server running at http://localhost:${port}` : '❗️ Server not running');
    }
}
