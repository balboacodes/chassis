import express from 'express';
import { loadEnvFile } from 'node:process';
import 'reflect-metadata';
import Application from '../src/framework/Application.js';

loadEnvFile();

if (!process.env.APP_NAME) {
    throw new Error('❗️ .env not loaded');
}

const app = express();

app.use(async (_req, _res, next) => {
    await new Application(app).boot();
    next();
});

const port = process.env.NODE_ENV === 'development' ? 3000 : 443;
const server = app.listen(port);
console.log(server.listening ? '🚀 Server running' : '❗️ Server not running');
