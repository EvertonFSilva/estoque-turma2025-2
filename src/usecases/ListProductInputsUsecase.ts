import ProductInput from "../entities/ProductInput";
import type { ProductInputRepositoryInterface } from "../repositories/ProductInputRepository";

export interface ListProductInputsUsecaseInterface {
  execute(): ProductInput[] | Error;
}

export class ListProductInputsUsecase implements ListProductInputsUsecaseInterface {
  private productInputRepository: ProductInputRepositoryInterface;

  constructor(productInputRepository: ProductInputRepositoryInterface) {
    this.productInputRepository = productInputRepository;
  }

  public execute(): ProductInput[] | Error {
    try {
      return this.productInputRepository.listAll();
    } catch (error) {
      return new Error("Error listing product inputs");
    }
  }
}
