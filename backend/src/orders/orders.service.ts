import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { SupplierService } from '../supplier/supplier.service';

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
        private supplierService: SupplierService,
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
        const order = await this.findOne(id);
        const oldStatus = order.status;

        await this.ordersRepository.update(id, { status });
        const updatedOrder = await this.findOne(id);

        // If order just became PAID, trigger supplier order
        if (oldStatus !== OrderStatus.PAID && status === OrderStatus.PAID) {
            try {
                // In a real app, you'd get customer info from order or user
                // For MVP, we'll use order items and some placeholder shipping info
                const cjOrder = await this.supplierService.createOrder({
                    orderNumber: order.id,
                    shippingAddress: {
                        customerName: order.user?.name || 'Customer',
                        countryCode: 'US', // Placeholder
                        province: 'CA',
                        city: 'Los Angeles',
                        address: '123 Test St',
                        zip: '90001',
                        phone: '123456789',
                    },
                    products: order.items.map(item => ({
                        vid: item.product.sku, // Assuming SKU is VID for simplicity in MVP
                        quantity: item.quantity,
                    }))
                });

                if (cjOrder && cjOrder.orderId) {
                    await this.ordersRepository.update(id, {
                        supplierOrderId: cjOrder.orderId,
                    });
                }
            } catch (error) {
                console.error('Failed to place order with CJ:', error);
                // In production, you'd queue this for retry or alert admin
            }
        }

        return updatedOrder;
    }

    async findBySupplierOrderId(supplierOrderId: string): Promise<Order | null> {
        return this.ordersRepository.findOne({
            where: { supplierOrderId },
            relations: ['items', 'items.product', 'user'],
        });
    }

    async updateFromSupplier(supplierOrderId: string, status: string, trackingNumber?: string): Promise<Order | null> {
        const order = await this.findBySupplierOrderId(supplierOrderId);
        if (!order) return null;

        // Map CJ statuses to internal statuses
        let internalStatus = order.status;
        const s = status.toUpperCase();

        if (s.includes('PAID') || s.includes('PROCESS')) internalStatus = OrderStatus.PAID;
        if (s.includes('SHIP') || s.includes('SENT')) internalStatus = OrderStatus.SHIPPED;
        if (s.includes('DELIVER') || s.includes('COMPLET')) internalStatus = OrderStatus.DELIVERED;
        if (s.includes('CANCEL') || s.includes('REFUND')) internalStatus = OrderStatus.CANCELLED;

        await this.ordersRepository.update(order.id, {
            status: internalStatus,
            trackingNumber: trackingNumber || order.trackingNumber,
        });

        return this.findOne(order.id);
    }

    async findAll(): Promise<Order[]> {
        return this.ordersRepository.find({
            relations: ['items', 'items.product', 'user'],
            order: { createdAt: 'DESC' },
        });
    }
}
