import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SupplierService } from './supplier.service';

@Controller('supplier')
export class SupplierController {
    constructor(private readonly supplierService: SupplierService) { }

    @Get('products')
    searchProducts(
        @Query('keyword') keyword?: string,
        @Query('categoryId') categoryId?: string,
        @Query('page') page?: string,
        @Query('pageSize') pageSize?: string,
    ): Promise<any> {
        return this.supplierService.searchProducts({
            keyword,
            categoryId,
            pageNum: page ? parseInt(page) : 1,
            pageSize: pageSize ? parseInt(pageSize) : 20,
        });
    }

    @Get('product/:pid')
    getProduct(@Param('pid') pid: string): Promise<any> {
        return this.supplierService.getProduct(pid);
    }

    @Get('categories')
    getCategories(): Promise<any> {
        return this.supplierService.getCategories();
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('shipping')
    getShippingMethods(
        @Query('from') from: string,
        @Query('to') to: string,
        @Query('weight') weight: string,
    ): Promise<any> {
        return this.supplierService.getShippingMethods({
            startCountryCode: from || 'CN',
            endCountryCode: to,
            productWeight: parseFloat(weight) || 0.5,
        });
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('tracking/:trackingNumber')
    getTracking(@Param('trackingNumber') trackingNumber: string): Promise<any> {
        return this.supplierService.getTracking(trackingNumber);
    }

    @Get('debug-cj')
    async debugCj(): Promise<any> {
        return this.supplierService.debugCj();
    }
}
