"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supplier_service_1 = require("./supplier.service");
describe('SupplierService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [supplier_service_1.SupplierService],
        }).compile();
        service = module.get(supplier_service_1.SupplierService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=supplier.service.spec.js.map