import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
    private stripe: Stripe;
    private readonly logger = new Logger(PaymentService.name);

    constructor(private configService: ConfigService) {
        const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        if (!secretKey) {
            this.logger.error('STRIPE_SECRET_KEY is not defined');
            throw new Error('Stripe configuration missing');
        }
        this.stripe = new Stripe(secretKey, {
            apiVersion: '2024-12-18.acacia', // Use latest or compatible API version
        });
    }

    async createPaymentIntent(amount: number, currency: string = 'usd') {
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Stripe expects cents
                currency,
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            return {
                clientSecret: paymentIntent.client_secret,
                id: paymentIntent.id,
            };
        } catch (error) {
            this.logger.error(`Error creating payment intent: ${error.message}`);
            throw error;
        }
    }
}
