import '@std/dotenv/load';

export default class Application {
    public serve(): void {
        Deno.serve((_req) => new Response(Deno.env.get('APP_NAME')));
    }
}
