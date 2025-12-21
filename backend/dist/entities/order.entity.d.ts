import { User } from './user.entity';
import { OrderItem } from './order-item.entity';
export declare enum OrderStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED"
}
export declare class Order {
    id: string;
    user: User;
    status: OrderStatus;
    totalAmount: number;
    supplierOrderId: string;
    trackingNumber: string;
    createdAt: Date;
    updatedAt: Date;
    items: OrderItem[];
}
