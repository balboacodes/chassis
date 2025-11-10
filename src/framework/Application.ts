import { type Express } from 'express';
import fs from 'fs';
import path from 'node:path';
import Container from './Container.js';
import ConfigServiceProvider from './providers/ConfigServiceProvider.js';
import RouteServiceProvider from './providers/RouteServiceProvider.js';
import { Class } from './types.js';

export default class Application extends Container {
    private providers: Set<Class> = new Set([ConfigServiceProvider, RouteServiceProvider]);

    public constructor(public router: Express) {
        super();
    }

    public async boot(): Promise<void> {
        await this.bootProviders();
    }

    private async bootProviders(): Promise<void> {
        await this.loadProviders();

        for (let provider of this.providers) {
            const p = new provider();

            if (p.register) await p.register(this);
            if (p.boot) await p.boot(this);
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
}
