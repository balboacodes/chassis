import { UsersController } from '../app/controllers/UsersControllers.ts';
import { Route } from '../src/facades/Route.ts';
import { Redirect } from '../src/http/Redirect.ts';

export default (): void => {
    Route.name('home').get('/', (request) => new Redirect(request).route('users.index'));
    Route.middleware([]).resource('users', UsersController);
    Route.redirect('/redirect', '/');
    Route.get('/facade', () => {
        return new Response(
            `
            <!doctype html>
            <html>
                <head>
                    <title>Facade</title>
                </head>
                <body>
                    <h1>Facade</h1>
                    <div id="cookie"></div>
                    <script>
                        const div = document.getElementById('cookie');
                        const cookie = document.cookie.split('; ')[0].split('=')[1];
                        div.innerText = cookie;
                    </script>
                </body>
            </html>
        `,
            {
                headers: { 'Content-Type': 'html' },
            },
        );
    });
    Route.get('/back', (request) => new Redirect(request).back());
    Route.get('/with', (request) => new Redirect(request).with('test', 'testing-flash').to('/facade'));
};
