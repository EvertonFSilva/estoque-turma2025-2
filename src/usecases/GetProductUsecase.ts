import Product from "../entities/Product";
import type { ProductRepositoryInterface } from "../repositories/ProductRepository";

export interface GetProductUsecaseInterface {
    execute(barcode: string): Product | Error;
}

export class GetProductUsecase implements GetProductUsecaseInterface {

    private productRepository: ProductRepositoryInterface;

    constructor(productRepository: ProductRepositoryInterface) {
        this.productRepository = productRepository;
    }

    public execute(barcode: string): Product | Error {
        try {
            const product = this.productRepository.findByBarcode(barcode);
            if (!product) {
                return new Error("Product not found");
            }
            return product;
        } catch (error) {
            return new Error("Error retrieving product");
        }
    }
}
