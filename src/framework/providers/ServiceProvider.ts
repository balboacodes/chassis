import App from '../App.js';

export default abstract class ServiceProvider {
    public register?(app: App): void | Promise<void>;

    public boot?(app: App): void | Promise<void>;
}
