import type { ProductRepositoryInterface } from "../repositories/ProductRepository";

export interface DeleteProductUseCaseInterface {
    execute(barcode: string): { message: string } | Error;
}

export class DeleteProductUseCase implements DeleteProductUseCaseInterface {

    private productRepository: ProductRepositoryInterface;

    constructor(productRepository: ProductRepositoryInterface) {
        this.productRepository = productRepository;
    }

    public execute(barcode: string): { message: string } | Error {

        const product = this.productRepository.findByBarcode(barcode);

        if (!product) {
            return new Error("Product not found");
        }

        const deleted = this.productRepository.delete(barcode);

        if (!deleted) {
            return new Error("Internal server error");
        }

        return { message: "Product deleted successfully" };
    }
}