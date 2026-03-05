import ProductInput from "../entities/ProductInput";
import type { ProductInputRepositoryInterface } from "../repositories/ProductInputRepository";
import type { ProductOrderRepositoryInterface } from "../repositories/ProductOrderRepository";
import type { ProductRepositoryInterface } from "../repositories/ProductRepository";

export interface CreateProductInputUseCaseInterface {
    execute(productOrderId: string, quantity: number, inputDate: Date): { productInput: ProductInput; productOrder: any; newStock: number } | Error;
}

export class CreateProductInputUseCase implements CreateProductInputUseCaseInterface {
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

    public execute(productOrderId: string, quantity: number, inputDate: Date): { productInput: ProductInput; productOrder: any; newStock: number } | Error {
        try {
            const productOrder = this.productOrderRepository.findByUuid(productOrderId);
            if (!productOrder) {
                return new Error("Product order not found");
            }

            if (productOrder.getStatus() !== "opened") {
                return new Error("Product order is not in opened status");
            }

            if (productOrder.getOrderDate() > inputDate) {
                return new Error("Input date cannot be before the product order date");
            }

            const product = productOrder.getProduct();
            const newStock = product.getQuantityInStock() + quantity;

            const productInput = ProductInput.create(productOrderId, quantity, inputDate);
            if (productInput instanceof Error) {
                return productInput;
            }

            this.productInputRepository.save(productInput);
            this.productOrderRepository.updateStatus(productOrderId, "closed");
            this.productRepository.updateStock(product.getBarcode(), newStock);

            return { productInput, productOrder, newStock };
        } catch (error) {
            if (error instanceof Error && error.message.includes("not found")) {
                return new Error("Product not found");
            }
            return new Error("Internal server error");
        }
    }
}
