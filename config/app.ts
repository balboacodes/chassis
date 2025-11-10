export default {
    name: process.env.APP_NAME ?? 'Chassis',
    env: process.env.NODE_ENV ?? 'development',
    url: process.env.APP_URL ?? 'localhost',
    port: process.env.APP_PORT ?? 3000,
};
