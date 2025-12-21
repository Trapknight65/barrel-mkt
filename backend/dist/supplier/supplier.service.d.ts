import { ConfigService } from '@nestjs/config';
interface CJProduct {
    productId: string;
    productName: string;
    sellPrice: number;
    imageUrl: string;
    categoryName: string;
}
export declare class SupplierService {
    private configService;
    private readonly apiKey;
    private readonly baseUrl;
    constructor(configService: ConfigService);
    fetchProducts(categoryId?: string, page?: number, pageSize?: number): Promise<CJProduct[]>;
    placeOrder(orderData: any): Promise<{
        orderId: string;
        success: boolean;
    }>;
    getTracking(cjOrderId: string): Promise<any>;
}
export {};
