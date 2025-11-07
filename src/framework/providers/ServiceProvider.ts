import { Container } from '../Container.js';

export abstract class ServiceProvider {
    public abstract register(app: Container): void | Promise<void>;

    public boot?(app: Container): void | Promise<void>;
}
