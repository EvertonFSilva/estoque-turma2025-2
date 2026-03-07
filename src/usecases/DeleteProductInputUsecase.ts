import type { ProductInputRepositoryInterface } from "../repositories/ProductInputRepository";
import type { ProductOrderRepositoryInterface } from "../repositories/ProductOrderRepository";
import type { ProductRepositoryInterface } from "../repositories/ProductRepository";

export interface DeleteProductInputUseCaseInterface {
    execute(productInputId: string): { message: string } | Error;
}

export class DeleteProductInputUseCase implements DeleteProductInputUseCaseInterface {
    private productInputRepository: ProductInputRepositoryInterface;
    private productOrderRepository: ProductOrderRepositoryInterface;
    private productRepository: ProductRepositoryInterface;

    constructor(
        productInputRepository: ProductInputRepositoryInterface,
        productOrderRepository: ProductOrderRepositoryInterface,
        productRepository: ProductRepositoryInterface
    ) {
        this.productInputRepository = productInputRepository;
        this.productOrderRepository = productOrderRepository;
        this.productRepository = productRepository;
    }

    public execute(productInputId: string): { message: string } | Error {
        try {
            const productInput = this.productInputRepository.findByUuid(productInputId);
            if (!productInput) {
                return new Error("Product input not found");
            }

            const productOrder = this.productOrderRepository.findByUuid(productInput.getProductOrderId());
            if (!productOrder) {
                return new Error("Product order not found");
            }

            const product = productOrder.getProduct();

            if (product.getQuantityInStock() < productInput.getQuantity()) {
                return new Error("Cannot delete product input as it would result in negative stock");
            }

            this.productInputRepository.delete(productInputId);

            productOrder.openProductOrder();
            this.productOrderRepository.updateStatus(productOrder);

            const newStock = product.getQuantityInStock() - productInput.getQuantity();
            this.productRepository.updateStock(product.getBarcode(), newStock);

            return { message: "Product input deleted successfully" };
        } catch (error) {
            if (error instanceof Error && error.message.includes("not found")) {
                return new Error("Product not found");
            }
            return new Error("Internal server error");
        }
    }
}
