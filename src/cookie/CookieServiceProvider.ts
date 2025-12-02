import { Repository } from '../config/Repository.ts';
import { App } from '../facades/App.ts';
import { ServiceProvider } from '../providers/ServiceProvider.ts';
import { CookieJar } from './CookieJar.ts';

export class CookieServiceProvider extends ServiceProvider {
    /**
     * Register the service provider.
     */
    public override register(): void {
        App.singleton('cookie', () => {
            const config = App.resolve<Repository>('chassis.config').get('session') as Record<string, unknown>;

            return (new CookieJar()).setDefaultPathAndDomain(
                config['path'] as string,
                config['domain'] as string,
                config['secure'] as boolean,
                config['same_site'] as string,
            );
        });
    }
}
