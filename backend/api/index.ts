import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

let app;

export default async function handler(req, res) {
    if (!app) {
        app = await NestFactory.create(AppModule);
        app.setGlobalPrefix('api');
        app.enableCors({
            origin: true,
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            credentials: true,
        });
        await app.init();
    }
    const expressApp = app.getHttpAdapter().getInstance();
    return expressApp(req, res);
}
