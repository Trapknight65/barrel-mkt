import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { OrderStatus } from '../entities/order.entity';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Request() req, @Body() createOrderDto: any) {
        return this.ordersService.create(req.user.userId, createOrderDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    findUserOrders(@Request() req) {
        return this.ordersService.findUserOrders(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ordersService.findOne(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
        return this.ordersService.updateStatus(id, status);
    }

    // Admin endpoint to view all orders
    @UseGuards(AuthGuard('jwt'))
    @Get('admin/all')
    findAll() {
        return this.ordersService.findAll();
    }
}
