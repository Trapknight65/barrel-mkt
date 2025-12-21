import { OrderItem } from './order-item.entity';
export declare class Product {
    id: string;
    title: string;
    description: string;
    price: number;
    sku: string;
    imageUrl: string;
    category: string;
    supplierId: string;
    stock: number;
    createdAt: Date;
    updatedAt: Date;
    orderItems: OrderItem[];
}
