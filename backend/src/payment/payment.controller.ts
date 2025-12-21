import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('intent')
    async createPaymentIntent(@Body() body: { amount: number; currency?: string }) {
        return this.paymentService.createPaymentIntent(body.amount, body.currency);
    }
}
