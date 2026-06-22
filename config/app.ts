export default {
  env: Deno.env.get("APP_ENV") ?? "development",
  name: Deno.env.get("APP_NAME") ?? "Chassis",
  url: Deno.env.get("APP_URL") ?? "http://localhost",
  hostname: Deno.env.get("APP_HOSTNAME") ?? "localhost",
  port: Deno.env.get("APP_PORT") ?? 8000,
};
