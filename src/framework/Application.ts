import { type Express, type NextFunction, type Request, type Response } from 'express';
import fs from 'fs';
import path from 'node:path';
import Container from './Container.js';
import ConfigServiceProvider from './providers/ConfigServiceProvider.js';
import RouteServiceProvider from './providers/RouteServiceProvider.js';
import { Class } from './types.js';

export default class Application extends Container {
    private providers: Set<Class> = new Set([ConfigServiceProvider, RouteServiceProvider]);

    public constructor(
        public router: Express,
        private req: Request,
        private res: Response,
        private next: NextFunction,
    ) {
        super();
    }

    /**
     * @throws {Error} If container instance was not set or response and response were not bound.
     */
    public async boot(): Promise<void> {
        Container.setInstance(this);

        if (Container.getInstance() !== this) {
            throw new Error('❗️ Container instance not set');
        }

        this.singleton('router', () => this.router);

        if (!this.bound('router')) {
            throw new Error('❗️ Router not bound');
        }

        this.singleton('request', () => this.req);

        if (!this.bound('request')) {
            throw new Error('❗️ Request not bound');
        }

        this.singleton('response', () => this.res);

        if (!this.bound('response')) {
            throw new Error('❗️ Response not bound');
        }

        this.singleton('next', () => this.next);

        if (!this.bound('next')) {
            throw new Error('❗️ Next not bound');
        }

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
