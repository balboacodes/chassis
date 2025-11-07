import dotenv from 'dotenv';
import path from 'path';
import { Config } from '../Config.js';
import { Container } from '../Container.js';
import { ServiceProvider } from './ServiceProvider.js';

export class ConfigServiceProvider extends ServiceProvider {
    public async register(app: Container): Promise<void> {
        dotenv.config();

        // Load config files
        const config = new Config();
        const configPath = path.resolve(process.cwd(), 'src/config');
        await config.loadConfigDir(configPath);

        app.singleton('config', () => config);
    }
}
