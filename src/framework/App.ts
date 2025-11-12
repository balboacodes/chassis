import { Arr } from '@balboacodes/laravel-helpers';
import { type NextFunction, type Request, type Response } from 'express';
import fs from 'fs';
import path from 'node:path';
import { loadEnvFile } from 'node:process';
import Container from './Container.ts';
import ConfigServiceProvider from './providers/ConfigServiceProvider.ts';
import RouteServiceProvider from './providers/RouteServiceProvider.ts';
import ServiceProvider from './providers/ServiceProvider.ts';
import Router from './routing/Router.ts';
import { app, config } from './support/helpers.ts';
import { Class } from './types.ts';

export default class App extends Container {
    private middleware: Set<Class> = new Set([]);

    private providers: Set<Class<ServiceProvider>> = new Set([ConfigServiceProvider, RouteServiceProvider]);

    public withMiddleware(middleware: Class | Class[]): this {
        for (const mw of Arr.wrap(middleware)) {
            this.middleware.add(mw);
        }

        return this;
    }

    public async start(): Promise<void> {
        Container.setInstance(this);
        this.bootSingletons();
        this.bootEnv();
        this.bootMiddleware();
        await this.bootProviders();
        this.listen();
    }

    private bootEnv(): void {
        loadEnvFile();

        if (!process.env.APP_NAME) {
            throw new Error('❗️ .env not loaded');
        }
    }

    private bootSingletons(): void {
        this.singleton(Router, () => new Router());
    }

    private async bootMiddleware(): Promise<void> {
        for (const middleware of this.middleware) {
            app(Router).registerGlobalMiddleware((req: Request, res: Response, next: NextFunction) => {
                new middleware().handle(req, res, next);
            });
        }
    }

    private async bootProviders(): Promise<void> {
        await this.loadProviders();

        for (const provider of this.providers) {
            const instance = new provider(this);

            if (instance.bindings) {
                for (const binding of instance.bindings) {
                    this.bind(binding, () => new binding());
                }
            }

            if (instance.singletons) {
                for (const singleton of instance.singletons) {
                    this.singleton(singleton, () => new singleton());
                }
            }

            if (instance.register) await instance.register();
        }

        for (const provider of this.providers) {
            const instance = new provider(this);

            if (instance.boot) {
                const paramTypes: any[] = Reflect.getMetadata('design:paramtypes', instance, 'boot') ?? [];
                const dependencies = paramTypes.map((dep) => this.make(dep));

                await instance.boot(...dependencies);
            }
        }
    }

    /**
     * @throws {Error} If provider file does not contain a default class export.
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

        app(Router).listen(port, url);
    }
}
