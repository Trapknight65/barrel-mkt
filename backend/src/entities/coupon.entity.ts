import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum DiscountType {
    PERCENT = 'PERCENT',
    FIXED = 'FIXED',
}

@Entity()
export class Coupon {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    code: string;

    @Column({
        type: 'enum',
        enum: DiscountType,
        default: DiscountType.PERCENT,
    })
    discountType: DiscountType;

    @Column('decimal', { precision: 10, scale: 2 })
    value: number;

    @Column({ type: 'timestamp', nullable: true })
    expiryDate: Date;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: 0 })
    usageCount: number;

    @Column({ nullable: true })
    usageLimit: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
