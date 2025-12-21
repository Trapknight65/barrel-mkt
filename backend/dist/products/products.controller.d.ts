import { ProductsService } from './products.service';
import { Product } from '../entities/product.entity';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(category?: string): Promise<Product[]>;
    findOne(id: string): Promise<Product>;
    create(productData: Partial<Product>): Promise<Product>;
    uploadCsv(file: any): Promise<any>;
    update(id: string, productData: Partial<Product>): Promise<Product>;
    remove(id: string): Promise<void>;
}
