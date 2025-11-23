export default {
    env: Deno.env.get('APP_ENV') ?? 'local',
    name: Deno.env.get('APP_NAME') ?? 'Chassis',
    url: Deno.env.get('APP_URL') ?? 'http://localhost',
    port: Deno.env.get('APP_PORT') ?? 3000,
};
