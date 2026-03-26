import type { ProductOrderRepositoryInterface } from "../repositories/ProductOrderRepository";
import type { ProductInputRepositoryInterface } from "../repositories/ProductInputRepository";

export interface DeleteProductOrderUseCaseInterface {
    execute(productOrderId: string): { message: string } | Error;
}

export class DeleteProductOrderUseCase implements DeleteProductOrderUseCaseInterface {
    private productOrderRepository: ProductOrderRepositoryInterface;
    private productInputRepository: ProductInputRepositoryInterface;

    constructor(
        productOrderRepository: ProductOrderRepositoryInterface,
        productInputRepository: ProductInputRepositoryInterface,        
    ) {
        this.productOrderRepository = productOrderRepository;
        this.productInputRepository = productInputRepository;
    }

    public execute(productOrderId: string): { message: string; } | Error {
        try {

            const productOrder = this.productOrderRepository.findByUuid(productOrderId);
            if (!productOrder) {
                return new Error("Product order not found");
            }

            const productInput = this.productInputRepository.findByProductOrder_fk(productOrderId);
            if (productInput){
                return new Error("Cannot delete product order with associated product input" );
            }

            this.productOrderRepository.delete(productOrderId);

            return { message: "Product Order deleted successfully" };

        } catch (error) {

            return new Error("Internal server error");
        }
    }

}

