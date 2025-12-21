import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

let app;

export default async function handler(req, res) {
    try {
        if (!app) {
            app = await NestFactory.create(AppModule);

            // Set global prefix
            app.setGlobalPrefix('api');

            app.enableCors({
                origin: true,
                methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
                credentials: true,
            });
            await app.init();
        }
        const expressApp = app.getHttpAdapter().getInstance();
        console.log('[DEBUG] Serverless Request URL:', req.url);
        return expressApp(req, res);
    } catch (error) {
        console.error('SERVERLESS STARTUP ERROR:', error);
        res.status(500).json({
            error: 'Serverless initialization failed',
            message: error.message,
            stack: error.stack,
        });
    }
}
