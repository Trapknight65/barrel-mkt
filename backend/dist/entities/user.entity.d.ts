import { Order } from './order.entity';
export declare enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN"
}
export declare class User {
    id: string;
    email: string;
    password?: string;
    name: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
    orders: Order[];
}
