import ProductOrder from "../entities/ProductOrder";
import Product from "../entities/Product";
import type { ProductOrderRepositoryInterface } from "../repositories/ProductOrderRepository";
import type { ProductRepositoryInterface } from "../repositories/ProductRepository";

export interface CreateProductOrderUsecaseInterface {
    execute(barcode: string, quantity: number, orderDate: Date): ProductOrder | Error;
}

export class CreateProductOrderUsecase implements CreateProductOrderUsecaseInterface {

    private productOrderRepository: ProductOrderRepositoryInterface;
    private productRepository: ProductRepositoryInterface;

    constructor(productOrderRepository: ProductOrderRepositoryInterface, productRepository: ProductRepositoryInterface) {
        this.productOrderRepository = productOrderRepository;
        this.productRepository = productRepository;
    }

    public execute(barcode: string, quantity: number, orderDate: Date): ProductOrder | Error {
        try {
            const product = this.productRepository.findByBarcode(barcode);
            if (!product) {
                return new Error("Product not found");
            }
            
            const newProductOrder = ProductOrder.create(product, quantity, orderDate);
            if (newProductOrder instanceof Error) {
                return new Error(newProductOrder.message);
            }

            this.productOrderRepository.save(newProductOrder);
            return newProductOrder;
        } catch (error) {
            return new Error("Error creating product order");
        }
    }
}
