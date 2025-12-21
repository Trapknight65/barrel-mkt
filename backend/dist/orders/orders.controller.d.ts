import { OrdersService } from './orders.service';
import { OrderStatus } from '../entities/order.entity';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(req: any, createOrderDto: any): Promise<import("../entities/order.entity").Order>;
    findUserOrders(req: any): Promise<import("../entities/order.entity").Order[]>;
    findOne(id: string): Promise<import("../entities/order.entity").Order>;
    updateStatus(id: string, status: OrderStatus): Promise<import("../entities/order.entity").Order>;
    findAll(): Promise<import("../entities/order.entity").Order[]>;
}
