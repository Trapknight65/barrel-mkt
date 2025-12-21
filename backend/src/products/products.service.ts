import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Readable } from 'stream';
const csv = require('csv-parser');

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

    async uploadCsv(buffer: Buffer): Promise<any> {
        const stream = Readable.from(buffer);
        const results: any[] = [];

        return new Promise((resolve, reject) => {
            stream
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', async () => {
                    let successCount = 0;
                    let errorCount = 0;

                    for (const item of results) {
                        try {
                            if (!item.sku || !item.title || !item.price) {
                                errorCount++;
                                continue;
                            }

                            const productData = {
                                title: item.title,
                                description: item.description || '',
                                price: parseFloat(item.price),
                                sku: item.sku,
                                stock: parseInt(item.stock) || 0,
                                category: item.category || 'General',
                                imageUrl: item.imageUrl || '',
                            };

                            const existing = await this.productsRepository.findOne({ where: { sku: item.sku } });
                            if (existing) {
                                await this.productsRepository.update(existing.id, productData);
                            } else {
                                await this.productsRepository.save(this.productsRepository.create(productData));
                            }
                            successCount++;
                        } catch (e) {
                            console.error('Error importing item:', item, e);
                            errorCount++;
                        }
                    }
                    resolve({ success: true, imported: successCount, failed: errorCount });
                })
                .on('error', (err) => reject(err));
        });
    }
}
