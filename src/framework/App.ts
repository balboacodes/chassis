import { type Express, default as express } from 'express';
import fs from 'fs';
import path from 'node:path';
import { loadEnvFile } from 'node:process';
import Container from './Container.js';
import ConfigServiceProvider from './providers/ConfigServiceProvider.js';
import RouteServiceProvider from './providers/RouteServiceProvider.js';
import ServiceProvider from './providers/ServiceProvider.js';
import { config } from './support/helpers.js';
import { Class } from './types.js';

export default class App extends Container {
    public router: Express = express();

    private providers: Set<Class<ServiceProvider>> = new Set([ConfigServiceProvider, RouteServiceProvider]);

    public async start(): Promise<void> {
        Container.setInstance(this);
        this.bootEnv();
        await this.bootProviders();
        this.listen();
    }

    private bootEnv(): void {
        loadEnvFile();

        if (!process.env.APP_NAME) {
            throw new Error('❗️ .env not loaded');
        }
    }

    private async bootProviders(): Promise<void> {
        await this.loadProviders();

        for (let provider of this.providers) {
            const p = new provider(this);

            if (p.register) await p.register();
            if (p.boot) await p.boot();
        }
    }

    /**
     * @throws {Error} If provider file does not contain a default export.
     */
    private async loadProviders(): Promise<void> {
        const providersDir = path.resolve(process.cwd(), 'app/providers');

        if (!fs.existsSync(providersDir)) return;

        const files = fs.readdirSync(providersDir).filter((f) => f.endsWith('.ts') || f.endsWith('.js'));

        for (const file of files) {
            const modulePath = path.join(providersDir, file);
            const providerModule = await import(modulePath);

            if (typeof providerModule.default !== 'function') {
                throw new Error(`❗️ ${file}: no default class exported`);
            }

            this.providers.add(providerModule.default);
        }
    }

    private listen(): void {
        const port = Number(config('app.port'));
        const url = config('app.url');

        this.router.listen(port, url, () => {
            console.log(`🚀 Server running at http://${url}:${port}`);
        });
    }
}
