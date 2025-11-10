import Application from '../Application.js';

export default abstract class ServiceProvider {
    public register?(app: Application): void | Promise<void>;

    public boot?(app: Application): void | Promise<void>;
}
