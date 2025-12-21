"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SupplierService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let SupplierService = SupplierService_1 = class SupplierService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(SupplierService_1.name);
        this.baseUrl = 'https://developers.cjdropshipping.com/api2.0/v1';
        this.accessToken = null;
        this.tokenExpiry = null;
        this.apiKey = this.configService.get('CJ_API_KEY') || '';
        this.httpClient = axios_1.default.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });
    }
    async getAccessToken() {
        if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
            return this.accessToken;
        }
        try {
            this.logger.log('Fetching new CJ access token...');
            const response = await this.httpClient.get('/authentication/getAccessToken', {
                params: { accessKey: this.apiKey },
            });
            if (response.data.result && response.data.data) {
                const tokenData = response.data.data;
                this.accessToken = tokenData.accessToken;
                this.tokenExpiry = new Date(tokenData.accessTokenExpiryDate);
                this.logger.log('CJ access token obtained successfully');
                return this.accessToken;
            }
            throw new Error(response.data.message || 'Failed to get access token');
        }
        catch (error) {
            this.logger.error('Failed to get CJ access token:', error.message);
            throw new common_1.HttpException('CJ API authentication failed', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async cjRequest(method, endpoint, data, params) {
        var _a, _b;
        const token = await this.getAccessToken();
        try {
            const response = await this.httpClient.request({
                method,
                url: endpoint,
                data,
                params,
                headers: {
                    'CJ-Access-Token': token,
                },
            });
            if (response.data.result) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'CJ API request failed');
        }
        catch (error) {
            this.logger.error(`CJ API error (${endpoint}):`, error.message);
            throw new common_1.HttpException(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'CJ API request failed', common_1.HttpStatus.BAD_GATEWAY);
        }
    }
    async searchProducts(params) {
        this.logger.log(`Searching CJ products: ${JSON.stringify(params)}`);
        return this.cjRequest('GET', '/product/list', null, {
            productNameEn: params.keyword,
            categoryId: params.categoryId,
            pageNum: params.pageNum || 1,
            pageSize: params.pageSize || 20,
        });
    }
    async getProduct(pid) {
        this.logger.log(`Fetching CJ product: ${pid}`);
        return this.cjRequest('GET', '/product/query', null, { pid });
    }
    async getProductVariants(pid) {
        const product = await this.getProduct(pid);
        return product.variants || [];
    }
    async getCategories() {
        this.logger.log('Fetching CJ categories');
        return this.cjRequest('GET', '/product/getCategory');
    }
    async createOrder(params) {
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
        const result = await this.cjRequest('POST', '/shopping/order/createOrder', orderData);
        return {
            orderId: result.orderId,
            orderNumber: result.orderNumber,
            status: result.status || 'CREATED',
        };
    }
    async getOrder(orderId) {
        this.logger.log(`Fetching CJ order: ${orderId}`);
        return this.cjRequest('GET', '/shopping/order/getOrderDetail', null, { orderId });
    }
    async getShippingMethods(params) {
        this.logger.log(`Fetching shipping methods: ${params.startCountryCode} -> ${params.endCountryCode}`);
        return this.cjRequest('POST', '/logistic/freightCalculate', {
            startCountryCode: params.startCountryCode,
            endCountryCode: params.endCountryCode,
            weight: params.productWeight,
        });
    }
    async getTracking(trackingNumber) {
        this.logger.log(`Fetching tracking: ${trackingNumber}`);
        const result = await this.cjRequest('GET', '/logistic/getTrackInfo', null, {
            trackNumber: trackingNumber,
        });
        return {
            trackingNumber: result.trackNumber,
            carrier: result.logisticName || 'Unknown',
            status: result.status || 'Unknown',
            events: (result.trackInfoList || []).map((event) => ({
                date: event.date,
                location: event.location || '',
                description: event.trackInfo,
            })),
        };
    }
    async confirmPayment(orderId) {
        this.logger.log(`Confirming payment for order: ${orderId}`);
        await this.cjRequest('PATCH', '/shopping/order/confirmOrder', { orderId });
        return true;
    }
    async cancelOrder(orderId) {
        this.logger.log(`Cancelling order: ${orderId}`);
        await this.cjRequest('PATCH', '/shopping/order/cancelOrder', { orderId });
        return true;
    }
};
exports.SupplierService = SupplierService;
exports.SupplierService = SupplierService = SupplierService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SupplierService);
//# sourceMappingURL=supplier.service.js.map