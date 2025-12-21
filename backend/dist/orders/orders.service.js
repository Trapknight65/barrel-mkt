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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../entities/order.entity");
const order_item_entity_1 = require("../entities/order-item.entity");
const product_entity_1 = require("../entities/product.entity");
let OrdersService = class OrdersService {
    constructor(ordersRepository, orderItemsRepository, productsRepository) {
        this.ordersRepository = ordersRepository;
        this.orderItemsRepository = orderItemsRepository;
        this.productsRepository = productsRepository;
    }
    async create(userId, createOrderDto) {
        let totalAmount = 0;
        const orderItems = [];
        for (const item of createOrderDto.items) {
            const product = await this.productsRepository.findOne({ where: { id: item.productId } });
            if (!product) {
                throw new common_1.NotFoundException(`Product ${item.productId} not found`);
            }
            totalAmount += Number(product.price) * item.quantity;
            const orderItem = this.orderItemsRepository.create({
                product,
                quantity: item.quantity,
                price: product.price,
            });
            orderItems.push(orderItem);
        }
        const order = this.ordersRepository.create({
            user: { id: userId },
            totalAmount,
            status: order_entity_1.OrderStatus.PENDING,
        });
        const savedOrder = await this.ordersRepository.save(order);
        for (const item of orderItems) {
            item.order = savedOrder;
            await this.orderItemsRepository.save(item);
        }
        return this.findOne(savedOrder.id);
    }
    async findUserOrders(userId) {
        return this.ordersRepository.find({
            where: { user: { id: userId } },
            relations: ['items', 'items.product'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const order = await this.ordersRepository.findOne({
            where: { id },
            relations: ['items', 'items.product', 'user'],
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order ${id} not found`);
        }
        return order;
    }
    async updateStatus(id, status) {
        await this.ordersRepository.update(id, { status });
        return this.findOne(id);
    }
    async findAll() {
        return this.ordersRepository.find({
            relations: ['items', 'items.product', 'user'],
            order: { createdAt: 'DESC' },
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], OrdersService);
//# sourceMappingURL=orders.service.js.map