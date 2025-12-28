import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';
import { Product } from '../entities/product.entity';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    findAll(@Query('category') category?: string): Promise<Product[]> {
        return this.productsService.findAll(category);
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Product> {
        return this.productsService.findOne(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Body() productData: Partial<Product>): Promise<Product> {
        return this.productsService.create(productData);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    uploadCsv(@UploadedFile() file: any) {
        return this.productsService.uploadCsv(file.buffer);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('import-cj')
    importCjProduct(@Body() data: any): Promise<Product> {
        return this.productsService.importCjProduct(data);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    update(@Param('id') id: string, @Body() productData: Partial<Product>): Promise<Product> {
        return this.productsService.update(id, productData);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    remove(@Param('id') id: string): Promise<void> {
        return this.productsService.remove(id);
    }
}
