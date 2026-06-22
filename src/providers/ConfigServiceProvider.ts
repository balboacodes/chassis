import { expandGlob } from "@std/fs";
import { join } from "@std/path";
import { Repository } from "../config/Repository.ts";
import { App } from "../facades/App.ts";
import { ServiceProvider } from "./ServiceProvider.ts";

export class ConfigServiceProvider extends ServiceProvider {
  /**
   * @inheritdoc
   */
  public override async register(): Promise<void> {
    const path = join(Deno.cwd(), "config/*.ts");
    const files = await Array.fromAsync(expandGlob(path));
    const items: Record<string, unknown> = {};

    for (const file of files) {
      const name = file.name.substring(0, file.name.length - 3);
      const config: Record<string, unknown> = await import(file.path);

      items[name] = config.default;
    }

    App.singleton("chassis.config", () => new Repository(items));
  }
}
