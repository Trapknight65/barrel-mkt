import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../entities/product.entity';
import { SupplierService } from '../supplier/supplier.service';
interface CreateOrderItemDto {
    productId: string;
    quantity: number;
}
interface CreateOrderDto {
    items: CreateOrderItemDto[];
}
export declare class OrdersService {
    private ordersRepository;
    private orderItemsRepository;
    private productsRepository;
    private supplierService;
    constructor(ordersRepository: Repository<Order>, orderItemsRepository: Repository<OrderItem>, productsRepository: Repository<Product>, supplierService: SupplierService);
    create(userId: string, createOrderDto: CreateOrderDto): Promise<Order>;
    findUserOrders(userId: string): Promise<Order[]>;
    findOne(id: string): Promise<Order>;
    updateStatus(id: string, status: OrderStatus): Promise<Order>;
    findBySupplierOrderId(supplierOrderId: string): Promise<Order | null>;
    updateFromSupplier(supplierOrderId: string, status: string, trackingNumber?: string): Promise<Order | null>;
    findAll(): Promise<Order[]>;
}
export {};
