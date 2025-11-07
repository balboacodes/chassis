import { HomeController } from '../Controllers/HomeController';

export function registerRoutes(app) {
    app.app.get('/', HomeController, 'index'); // ✅ Controller method
    app.app.get('/ping', (req, res) => res.send('pong')); // ✅ Function
    // Anything else (strings, numbers, config values) is automatically skipped
}
