import { Controller, Post, Body, Logger } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';

@Controller('webhook')
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name);

    constructor(private readonly ordersService: OrdersService) { }

    @Post('cj')
    async handleCJWebhook(@Body() payload: any) {
        this.logger.log('Received CJ Webhook:', JSON.stringify(payload));

        // Handle different event types (simplified for MVP)
        // In production, we would check signature and specific event types
        if (payload.type === 'ORDER_STATUS_UPDATE') {
            // Logic to update order status
            this.logger.log(`Order ${payload.orderId} status updated to ${payload.status}`);
        }

        return { received: true };
    }
}
