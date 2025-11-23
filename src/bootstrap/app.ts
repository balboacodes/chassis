import { dirname, fromFileUrl } from '@std/path';
import { Application } from '../framework/foundation/Application.ts';

export const App = Application.configure(dirname(dirname(fromFileUrl(import.meta.url))));
// .withRouting(
//         web: __DIR__ . '/../routes/web.php',
//         api: __DIR__ . '/../routes/api.php',
//         commands: __DIR__ . '/../routes/console.php',
//         channels: __DIR__ . '/../routes/channels.php',
//         health: '/up',
// )
//     ->withMiddleware(function (Middleware $middleware): void {})
//     ->withExceptions(function (Exceptions $exceptions): void {
//         $exceptions->dontReportWhen(
//             fn(Throwable $e): bool => Str::contains(
//                 $e->getMessage(),
//                 'Missing required parameter for [Route: storage.local]',
//             ),
//         );

//         $exceptions->render(function (ViewException $e): void {
//             if (Str::contains($e->getMessage(), 'Missing required parameter for [Route: storage.local]')) {
//                 abort(418, 'Missing required image');
//             }
//         });

//         $exceptions->respond(function (Response $response): Response {
//             if ($response->getStatusCode() === 403) {
//                 abort(404);
//             }

//             return $response;
//         });
//     })
//     ->create();
