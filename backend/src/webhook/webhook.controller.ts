import { Controller, Post, Body, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';

@Controller('webhook')
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name);

    constructor(private readonly ordersService: OrdersService) { }

    @Post('cj')
    async handleCJWebhook(@Body() payload: any) {
        this.logger.log(`Received CJ Webhook: ${JSON.stringify(payload)}`);

        // Standard CJ Response Format
        const successResponse = { code: 200, result: true, message: 'success' };

        try {
            const { type, params } = payload;

            if (type === 'ORDER') {
                // Handle Order Status Update
                // params.orderNumber should be our internal Order ID (UUID) if we sent it during creation
                const { orderNumber, orderStatus } = params;
                if (orderNumber && orderStatus) {
                    this.logger.log(`Processing ORDER update for ${orderNumber} to ${orderStatus}`);
                    // We might need to map CJ status strings to our Enums
                    await this.ordersService.updateFromSupplier(orderNumber, orderStatus);
                }
            } else if (type === 'LOGISTIC') {
                // Handle Tracking Update
                // params.orderId is the CJ Order ID (supplierOrderId for us)
                const { orderId, trackingNumber, trackingStatus } = params;
                if (orderId) {
                    this.logger.log(`Processing LOGISTIC update for CJ Order ${orderId}`);
                    // We look up by supplierOrderId
                    // Note: updateFromSupplier in OrdersService expects supplierOrderId
                    // We pass trackingNumber if available
                    await this.ordersService.updateFromSupplier(orderId.toString(), 'SHIPPED', trackingNumber);
                }
            }

            return successResponse;
        } catch (error) {
            this.logger.error('Error processing webhook:', error);
            // Even if we fail, we might want to return 200 to CJ so they don't retry endlessly, 
            // but for now let's throw to see errors in logs.
            throw new HttpException('Webhook processing failed', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
