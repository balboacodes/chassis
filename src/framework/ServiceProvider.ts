import { Container } from './Container';

export abstract class ServiceProvider {
    abstract register(app: Container): void | Promise<void>;
    boot?(app: Container): void | Promise<void>;
}
