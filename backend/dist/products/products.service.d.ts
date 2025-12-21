import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
export declare class ProductsService {
    private productsRepository;
    constructor(productsRepository: Repository<Product>);
    findAll(category?: string): Promise<Product[]>;
    findOne(id: string): Promise<Product>;
    create(productData: Partial<Product>): Promise<Product>;
    update(id: string, productData: Partial<Product>): Promise<Product>;
    remove(id: string): Promise<void>;
    uploadCsv(buffer: Buffer): Promise<any>;
}
