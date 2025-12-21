import { Controller, Post, Body, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';

@Controller('webhook')
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name);

    constructor(private readonly ordersService: OrdersService) { }

    @Post('cj')
    async handleCJWebhook(@Body() payload: any) {
        this.logger.log(`Received CJ Webhook: ${JSON.stringify(payload)}`);

        try {
            // CJ Webhook structure usually contains 'type' and 'data'
            // For MVP, we'll try to extract order ID and status from common fields

            const { orderId, status, trackingNumber } = payload;

            if (orderId && status) {
                await this.ordersService.updateFromSupplier(orderId, status, trackingNumber);
                this.logger.log(`Updated order ${orderId} to status ${status}`);
            }

            return { received: true };
        } catch (error) {
            this.logger.error('Error processing webhook:', error);
            throw new HttpException('Webhook processing failed', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
