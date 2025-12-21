import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from '../entities/coupon.entity';

@Injectable()
export class CouponsService {
    constructor(
        @InjectRepository(Coupon)
        private couponsRepository: Repository<Coupon>,
    ) { }

    async findAll(): Promise<Coupon[]> {
        return this.couponsRepository.find();
    }

    async findByCode(code: string): Promise<Coupon> {
        const coupon = await this.couponsRepository.findOne({
            where: { code: code.toUpperCase(), isActive: true },
        });

        if (!coupon) {
            throw new NotFoundException('Invalid or expired coupon code');
        }

        // Check expiry
        if (coupon.expiryDate && new Date() > coupon.expiryDate) {
            coupon.isActive = false;
            await this.couponsRepository.save(coupon);
            throw new BadRequestException('Coupon has expired');
        }

        // Check usage limit
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            throw new BadRequestException('Coupon usage limit reached');
        }

        return coupon;
    }

    async create(couponData: Partial<Coupon>): Promise<Coupon> {
        const coupon = this.couponsRepository.create({
            ...couponData,
            code: couponData.code.toUpperCase(),
        });
        return this.couponsRepository.save(coupon);
    }

    async incrementUsage(id: string): Promise<void> {
        await this.couponsRepository.increment({ id }, 'usageCount', 1);
    }
}
