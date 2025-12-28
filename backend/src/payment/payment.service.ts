import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
    private stripe: Stripe;

    constructor(private configService: ConfigService) {
        const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        if (secretKey) {
            this.stripe = new Stripe(secretKey, {
                apiVersion: '2025-12-15.clover', // Use latest API version or valid one
            });
        }
    }

    async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<any> {
        if (!this.stripe) {
            throw new Error('Stripe is not configured in backend');
        }

        // Amount in cents
        const amountInCents = Math.round(amount * 100);

        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: amountInCents,
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
            console.error('Stripe Error:', error);
            throw new Error(`Payment failed: ${error.message}`);
        }
    }
}
