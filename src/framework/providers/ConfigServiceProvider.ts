import { expandGlob } from '@std/fs';
import { Config } from '../Config.ts';
import { ServiceProvider } from './ServiceProvider.ts';

export class ConfigServiceProvider extends ServiceProvider {
    /**
     * Register service provider.
     */
    public override async register(): Promise<void> {
        const files = await Array.fromAsync(expandGlob('config/*.ts'));
        const items: Record<string, unknown> = {};

        for (const file of files) {
            const name = file.name.substring(0, file.name.length - 3);
            const config: Record<string, unknown> = (await import(file.path)).default;

            items[name] = config;
        }

        this.app.singleton(Config, () => new Config(items));
    }
}
