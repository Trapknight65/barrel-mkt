import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../entities/product.entity';
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
    constructor(ordersRepository: Repository<Order>, orderItemsRepository: Repository<OrderItem>, productsRepository: Repository<Product>);
    create(userId: string, createOrderDto: CreateOrderDto): Promise<Order>;
    findUserOrders(userId: string): Promise<Order[]>;
    findOne(id: string): Promise<Order>;
    updateStatus(id: string, status: OrderStatus): Promise<Order>;
    findAll(): Promise<Order[]>;
}
export {};
