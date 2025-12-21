import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../entities/product.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { WebhooksController } from './webhooks.controller';
import { SupplierModule } from '../supplier/supplier.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Order, OrderItem, Product]),
        SupplierModule,
    ],
    controllers: [OrdersController, WebhooksController],
    providers: [OrdersService],
    exports: [OrdersService],
})
export class OrdersModule { }
