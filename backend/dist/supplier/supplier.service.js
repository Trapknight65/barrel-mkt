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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let SupplierService = class SupplierService {
    constructor(configService) {
        this.configService = configService;
        this.baseUrl = 'https://developers.cjdropshipping.com/api';
        this.apiKey = this.configService.get('CJ_API_KEY') || '';
    }
    async fetchProducts(categoryId, page = 1, pageSize = 20) {
        console.log(`[SupplierService] Fetching products. Category: ${categoryId}, Page: ${page}`);
        return [
            {
                productId: 'CJ_MOCK_001',
                productName: 'Action Camera Mount - Universal',
                sellPrice: 12.99,
                imageUrl: 'https://example.com/mount.jpg',
                categoryName: 'Camera Accessories',
            },
            {
                productId: 'CJ_MOCK_002',
                productName: 'Bike Phone Holder - Waterproof',
                sellPrice: 8.50,
                imageUrl: 'https://example.com/holder.jpg',
                categoryName: 'Bike Accessories',
            },
        ];
    }
    async placeOrder(orderData) {
        console.log('[SupplierService] Placing order:', orderData);
        if (!this.apiKey) {
            throw new common_1.HttpException('CJ API Key not configured', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return {
            orderId: `CJ_ORDER_${Date.now()}`,
            success: true,
        };
    }
    async getTracking(cjOrderId) {
        console.log('[SupplierService] Getting tracking for:', cjOrderId);
        return {
            orderId: cjOrderId,
            status: 'SHIPPED',
            trackingNumber: 'TRACK123456789',
            carrier: 'YunExpress',
        };
    }
};
exports.SupplierService = SupplierService;
exports.SupplierService = SupplierService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SupplierService);
//# sourceMappingURL=supplier.service.js.map