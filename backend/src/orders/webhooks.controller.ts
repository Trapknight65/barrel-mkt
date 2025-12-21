import { Controller, Post, Body, Headers, Logger, HttpStatus, HttpCode } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('webhooks')
export class WebhooksController {
    private readonly logger = new Logger(WebhooksController.name);

    constructor(private readonly ordersService: OrdersService) { }

    @Post('cj')
    @HttpCode(HttpStatus.OK)
    async handleCJWebhook(
        @Body() payload: any,
        @Headers('cj-signature') signature: string, // Not used but good for future security
    ) {
        this.logger.log(`Received CJ Webhook: ${JSON.stringify(payload)}`);

        // CJ Webhook format varies, but usually contains orderId and status
        // Example based on typical CJ patterns:
        const { orderId, status, trackingNumber } = payload;

        if (orderId) {
            await this.ordersService.updateFromSupplier(orderId, status, trackingNumber);
            this.logger.log(`Updated order ${orderId} status to ${status}`);
        }

        return { result: true, message: 'Webhook processed' };
    }

    @Post('generic')
    @HttpCode(HttpStatus.OK)
    async handleGenericWebhook(@Body() payload: any) {
        this.logger.log(`Received Generic Webhook: ${JSON.stringify(payload)}`);
        // Logic for other providers
        return { result: true };
    }
}
