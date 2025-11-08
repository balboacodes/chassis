import Container from '../Container.js';

export default abstract class ServiceProvider {
    public register?(app: Container): void | Promise<void>;

    public boot?(app: Container): void | Promise<void>;
}
