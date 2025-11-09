import fs from 'fs';
import path from 'path';
import { Arr } from './support/Arr.js';

export default class Config {
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

    public get(key: string, defaultValue: any = null): any {
        return Arr.get(this.items, key, defaultValue);
    }

    public set(key: Record<string, any> | string, value: any = null): void {
        const keys = typeof key === 'string' ? { [key]: value } : key;

        for (const [k, v] of Object.entries(keys)) {
            Arr.set(this.items, k, v);
        }
    }
}
