import { ServiceProvider } from '../../framework/ServiceProvider';
import { Container } from '../../framework/Container';

export class LoggerServiceProvider extends ServiceProvider {
    log(msg: string) {
        console.log(`[INFO] ${msg}`);
    }

    async register(app: Container) {
        // Bind the class instance itself
        app.singleton(LoggerServiceProvider, () => this);

        console.log('✅ Logger registered successfully');
    }
}
