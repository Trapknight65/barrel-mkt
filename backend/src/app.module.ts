import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { SupplierModule } from './supplier/supplier.module';
import { HealthController } from './health.controller';

import { CouponsModule } from './coupons/coupons.module';

import { PaymentModule } from './payment/payment.module';
// import { WebhookModule } from './webhook/webhook.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                url: configService.get<string>('DATABASE_URL'),
                autoLoadEntities: true,
                synchronize: true, // Dev only
            }),
            inject: [ConfigService],
        }),
        ProductsModule,
        AuthModule,
        UsersModule,
        OrdersModule,
        CouponsModule,
        SupplierModule,
        // WebhookModule,
        PaymentModule,
    ],
    controllers: [AppController, HealthController],
    providers: [AppService],
})
export class AppModule { }
