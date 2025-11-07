import fs from 'fs';
import path from 'path';

export class ConfigManager {
    private items: Record<string, any> = {};

    async loadConfigDir(configPath: string) {
        const files = fs.readdirSync(configPath);

        for (const file of files) {
            if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;

            const key = path.basename(file, path.extname(file));
            const modulePath = path.resolve(configPath, file);

            // ESM dynamic import
            const configModule = await import(modulePath);

            // Use default export if available, otherwise all exports
            this.items[key] = configModule.default ?? configModule;
        }
    }

    get<T = any>(key: string, defaultValue?: T): T {
        const [file, nestedKey] = key.split('.', 2);
        let value = this.items[file];
        if (nestedKey && value) {
            value = nestedKey.split('.').reduce((obj, k) => obj?.[k], value);
        }
        return (value ?? defaultValue) as T;
    }
}
