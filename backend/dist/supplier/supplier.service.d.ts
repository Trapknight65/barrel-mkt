import { ConfigService } from '@nestjs/config';
interface CJProduct {
    pid: string;
    productName: string;
    productNameEn: string;
    productImage: string;
    productWeight: number;
    productType: string;
    productUnit: string;
    sellPrice: number;
    categoryId: string;
    categoryName: string;
    sourceFrom: number;
    variants: CJVariant[];
}
interface CJVariant {
    vid: string;
    variantName: string;
    variantNameEn: string;
    variantImage: string;
    variantSku: string;
    variantWeight: number;
    variantVolume: number;
    variantSellPrice: number;
    variantStock: number;
}
interface CJOrderItem {
    vid: string;
    quantity: number;
}
interface CJShippingAddress {
    customerName: string;
    countryCode: string;
    province: string;
    city: string;
    address: string;
    address2?: string;
    zip: string;
    phone: string;
    email?: string;
}
export declare class SupplierService {
    private configService;
    private readonly logger;
    private readonly apiKey;
    private readonly baseUrl;
    private accessToken;
    private tokenExpiry;
    private httpClient;
    constructor(configService: ConfigService);
    private getAccessToken;
    private cjRequest;
    searchProducts(params: {
        keyword?: string;
        categoryId?: string;
        pageNum?: number;
        pageSize?: number;
    }): Promise<{
        list: CJProduct[];
        total: number;
    }>;
    getProduct(pid: string): Promise<CJProduct>;
    getProductVariants(pid: string): Promise<CJVariant[]>;
    getCategories(): Promise<any[]>;
    createOrder(params: {
        orderNumber: string;
        shippingAddress: CJShippingAddress;
        products: CJOrderItem[];
        shippingMethod?: string;
        remark?: string;
    }): Promise<{
        orderId: string;
        orderNumber: string;
        status: string;
    }>;
    getOrder(orderId: string): Promise<any>;
    getShippingMethods(params: {
        startCountryCode: string;
        endCountryCode: string;
        productWeight: number;
    }): Promise<any[]>;
    getTracking(trackingNumber: string): Promise<{
        trackingNumber: string;
        carrier: string;
        status: string;
        events: Array<{
            date: string;
            location: string;
            description: string;
        }>;
    }>;
    confirmPayment(orderId: string): Promise<boolean>;
    cancelOrder(orderId: string): Promise<boolean>;
}
export {};
