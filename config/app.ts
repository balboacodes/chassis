export default {
    env: Deno.env.get('APP_ENV') ?? 'development',
    name: Deno.env.get('APP_NAME') ?? 'Chassis',
    url: Deno.env.get('APP_URL') ?? 'http://localhost',
    hostname: Deno.env.get('APP_HOSTNAME') ?? 'localhost',
    port: Deno.env.get('APP_PORT') ?? 8000,
    /**
     * The key used for signing and verifying cookies. To generate an app key, follow these steps and paste the result
     * into your `.env` file:
     *
     * 1. `const key = await crypto.subtle.generateKey({ name: "HMAC", hash: "SHA-256" }, true, ["sign", "verify"]);`
     * 2. `const exported = await crypto.subtle.exportKey("raw", key);`
     * 3. `console.log(new Uint8Array(exported).toBase64());`
     */
    key: Deno.env.get('APP_KEY'),
};
