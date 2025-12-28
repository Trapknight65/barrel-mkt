import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { CouponsService } from '../coupons/coupons.service';
import { SupplierService } from '../supplier/supplier.service';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private orderItemsRepository: Repository<OrderItem>,
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
        private couponsService: CouponsService,
        private supplierService: SupplierService,
        private dataSource: DataSource,
    ) { }

    async create(userId: string, createOrderDto: { items: { productId: string; quantity: number }[], couponCode?: string }): Promise<Order> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
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

            let discountAmount = 0;
            if (createOrderDto.couponCode) {
                const coupon = await this.couponsService.findByCode(createOrderDto.couponCode);
                if (coupon) {
                    if (coupon.discountType === 'PERCENT') {
                        discountAmount = totalAmount * (Number(coupon.value) / 100);
                    } else {
                        discountAmount = Number(coupon.value);
                    }
                    totalAmount = Math.max(0, totalAmount - discountAmount);
                    await this.couponsService.incrementUsage(coupon.id);
                }
            }

            const order = this.ordersRepository.create({
                user: { id: userId } as User,
                totalAmount,
                status: OrderStatus.PENDING,
            });

            const savedOrder = await queryRunner.manager.save(order);

            for (const item of orderItems) {
                item.order = savedOrder;
                await queryRunner.manager.save(item);
            }

            await queryRunner.commitTransaction();
            return savedOrder;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
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
                        vid: item.product.cjVid || item.product.sku,
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
