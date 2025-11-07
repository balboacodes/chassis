import { ServiceProvider } from '../../framework/ServiceProvider';
import { ConfigManager } from '../../framework/Config';
import { Container } from '../../framework/Container';
import dotenv from 'dotenv';
import path from 'path';

export class ConfigServiceProvider extends ServiceProvider {
    async register(app: Container) {
        // Load .env
        dotenv.config();

        // Load config files
        const configManager = new ConfigManager();
        const configPath = path.resolve(process.cwd(), 'src/config');
        await configManager.loadConfigDir(configPath);

        // Register singleton
        app.singleton('config', () => configManager);

        console.log('✅ Config registered successfully');
    }
}
