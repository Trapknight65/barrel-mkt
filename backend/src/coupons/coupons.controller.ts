import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CouponsService } from './coupons.service';

@Controller('coupons')
export class CouponsController {
    constructor(private readonly couponsService: CouponsService) { }

    @Get('validate/:code')
    validate(@Param('code') code: string) {
        return this.couponsService.findByCode(code);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Body() couponData: any) {
        return this.couponsService.create(couponData);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    findAll() {
        return this.couponsService.findAll();
    }
}
