import express from 'express';
import 'reflect-metadata';
import Application from '../src/framework/Application.js';

const app = express();

await new Application(app).boot();

const port = process.env.NODE_ENV === 'development' ? 3000 : 443;
const server = app.listen(port);
console.log(server.listening ? '🚀 Server running' : '❗️ Server not running');
