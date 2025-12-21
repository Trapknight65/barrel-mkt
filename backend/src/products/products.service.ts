import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
    ) { }

    async findAll(category?: string): Promise<Product[]> {
        if (category) {
            return this.productsRepository.find({ where: { category } });
        }
        return this.productsRepository.find();
    }

    async findOne(id: string): Promise<Product> {
        const product = await this.productsRepository.findOne({ where: { id } });
        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }
        return product;
    }

    async create(productData: Partial<Product>): Promise<Product> {
        const newProduct = this.productsRepository.create(productData);
        return this.productsRepository.save(newProduct);
    }

    async update(id: string, productData: Partial<Product>): Promise<Product> {
        await this.productsRepository.update(id, productData);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        const result = await this.productsRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }
    }
}
