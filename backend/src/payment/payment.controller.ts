import { Controller, Post, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('intent')
    async createPaymentIntent(@Body() body: { amount: number; currency?: string }) {
        if (!body.amount) {
            throw new HttpException('Amount is required', HttpStatus.BAD_REQUEST);
        }

        try {
            return await this.paymentService.createPaymentIntent(body.amount, body.currency);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
