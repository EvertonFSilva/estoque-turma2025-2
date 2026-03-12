import type { ProductOutputRepositoryInterface } from "../repositories/ProductOutputRepository";
import type { ProductRepositoryInterface } from "../repositories/ProductRepository";

export interface DeleteProductOutputUseCaseInterface {
    execute(productOutputId: string): { message: string } | Error;
}

export class DeleteProductOutputUseCase implements DeleteProductOutputUseCaseInterface {

    constructor(
        private productOutputRepository: ProductOutputRepositoryInterface,
        private productRepository: ProductRepositoryInterface
    ) {}

    public execute(productOutputId: string): { message: string } | Error {
        try {

            const productOutput = this.productOutputRepository.findByUuid(productOutputId);

            if (!productOutput) {
                return new Error("Product output not found");
            }

            const product = productOutput.getProduct();

            const newStock =
                product.getQuantityInStock() + productOutput.getQuantity();

            this.productOutputRepository.delete(productOutputId);

            this.productRepository.updateStock(
                product.getBarcode(),
                newStock
            );

            return {
                message: "Product output deleted successfully"
            };

        } catch (error) {

            if (error instanceof Error && error.message.includes("not found")) {
                return new Error("Product not found");
            }

            return new Error("Internal server error");
        }
    }
}