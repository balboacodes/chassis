export default {
    name: process.env.APP_NAME || 'Chassis',
    env: process.env.NODE_ENV || 'development',
    debug: !!process.env.APP_DEBUG === true,
    port: Number.parseInt(process.env.APP_PORT || '3000', 10),
};
