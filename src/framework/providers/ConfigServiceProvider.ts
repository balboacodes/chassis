import dotenv from 'dotenv';
import path from 'path';
import Config from '../Config.js';
import Container from '../Container.js';
import ServiceProvider from './ServiceProvider.js';

export default class ConfigServiceProvider extends ServiceProvider {
    public async register(app: Container): Promise<void> {
        dotenv.config();

        // Load config files
        const config = new Config();
        const configPath = path.resolve(process.cwd(), 'config');
        await config.loadConfigDir(configPath);

        app.singleton(Config, () => config);

        console.log(app.bound(Config) ? '✅ Config registered successfully' : '❌ Config registered successfully');
    }
}
