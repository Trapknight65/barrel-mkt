import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';

interface CreateOrderItemDto {
    productId: string;
    quantity: number;
}

interface CreateOrderDto {
    items: CreateOrderItemDto[];
}

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private orderItemsRepository: Repository<OrderItem>,
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
    ) { }

    async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
        // Calculate total and validate products
        let totalAmount = 0;
        const orderItems: OrderItem[] = [];

        for (const item of createOrderDto.items) {
            const product = await this.productsRepository.findOne({ where: { id: item.productId } });
            if (!product) {
                throw new NotFoundException(`Product ${item.productId} not found`);
            }
            totalAmount += Number(product.price) * item.quantity;

            const orderItem = this.orderItemsRepository.create({
                product,
                quantity: item.quantity,
                price: product.price,
            });
            orderItems.push(orderItem);
        }

        // Create order
        const order = this.ordersRepository.create({
            user: { id: userId } as User,
            totalAmount,
            status: OrderStatus.PENDING,
        });
        const savedOrder = await this.ordersRepository.save(order);

        // Save order items with order reference
        for (const item of orderItems) {
            item.order = savedOrder;
            await this.orderItemsRepository.save(item);
        }

        return this.findOne(savedOrder.id);
    }

    async findUserOrders(userId: string): Promise<Order[]> {
        return this.ordersRepository.find({
            where: { user: { id: userId } },
            relations: ['items', 'items.product'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Order> {
        const order = await this.ordersRepository.findOne({
            where: { id },
            relations: ['items', 'items.product', 'user'],
        });
        if (!order) {
            throw new NotFoundException(`Order ${id} not found`);
        }
        return order;
    }

    async updateStatus(id: string, status: OrderStatus): Promise<Order> {
        await this.ordersRepository.update(id, { status });
        return this.findOne(id);
    }

    async findAll(): Promise<Order[]> {
        return this.ordersRepository.find({
            relations: ['items', 'items.product', 'user'],
            order: { createdAt: 'DESC' },
        });
    }
}
