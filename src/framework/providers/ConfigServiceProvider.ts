import path from 'path';
import Config from '../Config.ts';
import ServiceProvider from './ServiceProvider.ts';

export default class ConfigServiceProvider extends ServiceProvider {
    public async register(): Promise<void> {
        // Load config files
        const config = new Config();
        const configPath = path.resolve(process.cwd(), 'config');
        await config.loadConfigDir(configPath);

        this.app.singleton(Config, () => config, false);
    }
}
