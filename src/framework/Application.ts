import express from 'express';
import { Express } from 'express-serve-static-core';
import fs from 'fs';
import path from 'node:path';
import { loadEnvFile } from 'node:process';
import Container from './Container.js';
import { setAppInstance } from './helpers.js';
import ConfigServiceProvider from './providers/ConfigServiceProvider.js';
import LoggerServiceProvider from './providers/LoggerServiceProvider.js';
import RouteServiceProvider from './providers/RouteServiceProvider.js';

export default class Application extends Container {
    public router: Express = express();

    private providers = new Set([ConfigServiceProvider, LoggerServiceProvider, RouteServiceProvider]);

    public async boot(): Promise<this> {
        setAppInstance(this);

        loadEnvFile();
        console.log(process.env.APP_NAME ? '✅ .env loaded' : '❗️ .env not loaded');

        await this.bootProviders();

        return this;
    }

    public listen(port: number): void {
        const server = this.router.listen(port);
        console.log(server.listening ? `🚀 Server running at http://localhost:${port}` : '❗️ Server not running');
    }

    private async bootProviders(): Promise<void> {
        const providersDir = path.resolve(process.cwd(), 'app/providers');

        if (!fs.existsSync(providersDir)) {
            console.log('❗️ Service providers not booted');

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

        for (let provider of this.providers) {
            const p = new provider();

            if (p.register) await p.register(this);
            if (p.boot) await p.boot(this);
        }

        console.log('✅ Service providers booted');
    }
}
