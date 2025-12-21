import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
}

@Entity()
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.orders)
    user: User;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    @Column('decimal', { precision: 10, scale: 2 })
    totalAmount: number;

    @Column({ nullable: true })
    supplierOrderId: string;

    @Column({ nullable: true })
    trackingNumber: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => OrderItem, (item) => item.order)
    items: OrderItem[];
}
