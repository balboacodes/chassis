import { Route } from '../src/Route.ts';

export default function (): void {
    Route.get('/', () => new Response('here'));
    Route.get('/users/:id/comments/:commentId', (_request, ...params) => new Response(JSON.stringify(params)));
}
