import App from '../App.js';

export default abstract class ServiceProvider {
    public constructor(protected app: App) {}

    public register?(): void | Promise<void>;

    public boot?(): void | Promise<void>;
}
