import fs from 'fs';
import path from 'path';

export class Config {
    private items: Record<string, Record<string, any>> = {};

    public async loadConfigDir(configPath: string): Promise<void> {
        const files = fs.readdirSync(configPath);

        for (const file of files) {
            if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;

            const key = path.basename(file, path.extname(file));
            const modulePath = path.resolve(configPath, file);

            const configModule: Record<string, any> = await import(modulePath);

            this.items[key] = configModule.default ?? {};
        }
    }

    public get<T = any>(key: string, defaultValue?: T): T {
        const [file, nestedKey] = key.split('.', 2);
        let value = this.items[file];

        if (value && nestedKey) {
            value = nestedKey.split('.').reduce((object, key) => object?.[key], value);
        }

        return (value ?? defaultValue) as T;
    }
}
