import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

interface CJAccessToken {
    accessToken: string;
    accessTokenExpiryDate: string;
    refreshToken: string;
    refreshTokenExpiryDate: string;
}

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

@Injectable()
export class SupplierService {
    private readonly logger = new Logger(SupplierService.name);
    private readonly apiKey: string;
    private readonly baseUrl = 'https://developers.cjdropshipping.com/api2.0/v1';
    private accessToken: string | null = null;
    private tokenExpiry: Date | null = null;
    private httpClient: AxiosInstance;

    constructor(private configService: ConfigService) {
        this.apiKey = this.configService.get<string>('CJ_API_KEY') || '';

        this.httpClient = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });

        if (!this.apiKey) {
            this.logger.error('CRITICAL: CJ_API_KEY is missing from configuration!');
        } else {
            this.logger.log(`CJ_API_KEY loaded: ${this.apiKey.substring(0, 5)}...${this.apiKey.substring(this.apiKey.length - 4)} (Length: ${this.apiKey.length})`);
        }
    }

    /**
     * Get or refresh the CJ API access token
     */
    private async getAccessToken(): Promise<string> {
        // Return cached token if still valid
        if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
            return this.accessToken;
        }

        try {
            this.logger.log('Fetching new CJ access token...');

            // The API key is in the format: apiId@api@apiSecret
            const [apiId, _, apiSecret] = this.apiKey.split('@');

            if (!apiId || !apiSecret) {
                throw new Error('Invalid CJ_API_KEY format. Expected apiId@api@apiSecret');
            }

            const timestamp = Date.now();
            const crypto = require('crypto');
            const sign = crypto.createHash('md5').update(apiSecret + timestamp).digest('hex');

            const response = await this.httpClient.post('/authentication/getAccessToken', {
                apiId: apiId,
                apiSecret: apiSecret, // Sometimes needed alongside the sign
                sign: sign,
                timestamp: timestamp
            });

            if (response.data.result && response.data.data) {
                const tokenData: CJAccessToken = response.data.data;
                this.accessToken = tokenData.accessToken;
                this.tokenExpiry = new Date(tokenData.accessTokenExpiryDate);

                this.logger.log('CJ access token obtained successfully');
                return this.accessToken;
            }

            throw new Error(response.data.message || 'Failed to get access token');
        } catch (error: any) {
            this.logger.error('Failed to get CJ access token:', error.message);
            if (error.response) {
                this.logger.error('CJ Error Data:', JSON.stringify(error.response.data));
            }
            throw new HttpException(
                `!!! CRITICAL AUTH FAILURE !!! - ${error.message}${error.response ? ' - ' + JSON.stringify(error.response.data) : ''}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Make an authenticated request to CJ API
     */
    private async cjRequest<T>(
        method: 'GET' | 'POST' | 'PATCH',
        endpoint: string,
        data?: any,
        params?: any,
    ): Promise<T> {
        const token = await this.getAccessToken();

        try {
            const response = await this.httpClient.request({
                method,
                url: endpoint,
                data,
                params,
                headers: {
                    'CJ-Access-Token': token,
                    'platformToken': '',
                },
            });

            if (response.data.result) {
                return response.data.data;
            }

            throw new Error(response.data.message || 'CJ API request failed');
        } catch (error: any) {
            this.logger.error(`CJ API error (${endpoint}):`, error.message);
            if (error.response) {
                this.logger.error('CJ Details:', JSON.stringify(error.response.data));
            }
            throw new HttpException(
                error.response?.data?.message || 'CJ API request failed',
                HttpStatus.BAD_GATEWAY,
            );
        }
    }

    async searchProducts(params: {
        keyword?: string;
        categoryId?: string;
        pageNum?: number;
        pageSize?: number;
    }): Promise<{ list: CJProduct[]; total: number }> {
        this.logger.log(`Searching CJ products: ${JSON.stringify(params)}`);

        const result = await this.cjRequest<any>('GET', '/product/listV2', null, {
            keyWord: params.keyword,
            categoryId: params.categoryId,
            page: params.pageNum || 1,
            size: params.pageSize || 20,
        });

        // The API response structure for V2 is data.content[0].productList
        const list = result.content?.[0]?.productList || [];
        const total = result.totalRecords || 0;

        return { list, total };
    }

    /**
     * Get detailed product information
     */
    async getProduct(pid: string): Promise<CJProduct> {
        this.logger.log(`Fetching CJ product: ${pid}`);

        return this.cjRequest('GET', '/product/query', null, { pid });
    }

    /**
     * Get product variants and stock information
     */
    async getProductVariants(pid: string): Promise<CJVariant[]> {
        const product = await this.getProduct(pid);
        return product.variants || [];
    }

    /**
     * Get product categories
     */
    async getCategories(): Promise<any[]> {
        this.logger.log('Fetching CJ categories');

        return this.cjRequest('GET', '/product/getCategory');
    }

    /**
     * Create an order with CJ Dropshipping
     */
    async createOrder(params: {
        orderNumber: string;  // Your internal order ID
        shippingAddress: CJShippingAddress;
        products: CJOrderItem[];
        shippingMethod?: string;
        remark?: string;
    }): Promise<{
        orderId: string;
        orderNumber: string;
        status: string;
    }> {
        this.logger.log(`Creating CJ order: ${params.orderNumber}`);

        const orderData = {
            orderNumber: params.orderNumber,
            shippingCountryCode: params.shippingAddress.countryCode,
            shippingProvince: params.shippingAddress.province,
            shippingCity: params.shippingAddress.city,
            shippingAddress: params.shippingAddress.address,
            shippingAddress2: params.shippingAddress.address2 || '',
            shippingCustomerName: params.shippingAddress.customerName,
            shippingZip: params.shippingAddress.zip,
            shippingPhone: params.shippingAddress.phone,
            shippingEmail: params.shippingAddress.email || '',
            remark: params.remark || '',
            products: params.products.map((p) => ({
                vid: p.vid,
                quantity: p.quantity,
            })),
        };

        const result = await this.cjRequest<any>('POST', '/shopping/order/createOrderV2', {
            ...orderData,
            payType: '2', // Balance Payment
            fromCountryCode: 'CN', // Default to China
            logisticName: params.shippingMethod || 'CJ Packet',
            shippingCountry: params.shippingAddress.countryCode, // V2 often expects this
        });

        return {
            orderId: result.orderId,
            orderNumber: result.orderNumber,
            status: result.status || 'CREATED',
        };
    }

    /**
     * Get order details from CJ
     */
    async getOrder(orderId: string): Promise<any> {
        this.logger.log(`Fetching CJ order: ${orderId}`);

        return this.cjRequest('GET', '/shopping/order/getOrderDetail', null, { orderId });
    }

    /**
     * Get available shipping methods for a product to a country
     */
    async getShippingMethods(params: {
        startCountryCode: string;
        endCountryCode: string;
        productWeight: number;
    }): Promise<any[]> {
        this.logger.log(`Fetching shipping methods: ${params.startCountryCode} -> ${params.endCountryCode}`);

        return this.cjRequest('POST', '/logistic/freightCalculate', {
            startCountryCode: params.startCountryCode,
            endCountryCode: params.endCountryCode,
            weight: params.productWeight,
        });
    }

    /**
     * Get tracking information for an order
     */
    async getTracking(trackingNumber: string): Promise<{
        trackingNumber: string;
        carrier: string;
        status: string;
        events: Array<{
            date: string;
            location: string;
            description: string;
        }>;
    }> {
        this.logger.log(`Fetching tracking: ${trackingNumber}`);

        const result = await this.cjRequest<any>('GET', '/logistic/getTrackInfo', null, {
            trackNumber: trackingNumber,
        });

        return {
            trackingNumber: result.trackNumber,
            carrier: result.logisticName || 'Unknown',
            status: result.status || 'Unknown',
            events: (result.trackInfoList || []).map((event: any) => ({
                date: event.date,
                location: event.location || '',
                description: event.trackInfo,
            })),
        };
    }

    /**
     * Confirm payment for an order (triggers CJ to process)
     */
    async confirmPayment(orderId: string): Promise<boolean> {
        this.logger.log(`Confirming payment for order: ${orderId}`);

        await this.cjRequest('PATCH', '/shopping/order/confirmOrder', { orderId });
        return true;
    }

    /**
     * Cancel an order
     */
    async cancelOrder(orderId: string): Promise<boolean> {
        this.logger.log(`Cancelling order: ${orderId}`);

        await this.cjRequest('PATCH', '/shopping/order/cancelOrder', { orderId });
        return true;
    }
}
