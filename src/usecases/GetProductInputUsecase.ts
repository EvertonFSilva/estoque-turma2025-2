import ProductInput from "../entities/ProductInput";
import type { ProductInputRepositoryInterface } from "../repositories/ProductInputRepository";

export interface GetProductInputUsecaseInterface {
    execute(uuid: string): ProductInput | Error;
}

export class GetProductInputUsecase implements GetProductInputUsecaseInterface {

    private productInputRepository: ProductInputRepositoryInterface;

    constructor(productInputRepository: ProductInputRepositoryInterface) {
        this.productInputRepository = productInputRepository;
    }

    public execute(uuid: string): ProductInput | Error {
        try {
            const productInput = this.productInputRepository.findByUuid(uuid);
            if (!productInput) {
                return new Error("Product input not found");
            }
            return productInput;
        } catch (error) {
            return new Error("Error retrieving product input");
        }
    }
}
