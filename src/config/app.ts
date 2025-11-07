export default {
    name: process.env.APP_NAME || 'NodeLaravel',
    env: process.env.NODE_ENV || 'development',
    debug: process.env.APP_DEBUG === 'true',
    port: parseInt(process.env.APP_PORT || '3000', 10),
};
