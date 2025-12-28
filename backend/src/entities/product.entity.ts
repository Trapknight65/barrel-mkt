import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { OrderItem } from './order-item.entity';

@Entity()
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column('text')
    description: string;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column({ unique: true })
    sku: string;

    @Column({ nullable: true })
    imageUrl: string;

    @Column({ nullable: true })
    category: string;

    @Column({ nullable: true })
    supplierId: string; // ID from CJ or Supplier

    @Column({ nullable: true })
    cjPid: string; // CJ Product ID (PID)

    @Column({ nullable: true })
    cjVid: string; // CJ Variant ID (VID)

    @Column('int', { default: 0 })
    stock: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => OrderItem, (item) => item.product)
    orderItems: OrderItem[];
}
