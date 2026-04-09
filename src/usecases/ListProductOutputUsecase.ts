import ProductOutput from "../entities/ProductOutput";
import type { ProductOutputRepositoryInterface } from "../repositories/ProductOutputRepository";

export interface ListProductOutputUsecaseInterface {
  execute(): ProductOutput[] | Error;
}

export class ListProductOutputsUsecase implements ListProductOutputUsecaseInterface {
  private productOutputRepository: ProductOutputRepositoryInterface;

  constructor(productOutputRepository: ProductOutputRepositoryInterface) {
    this.productOutputRepository = productOutputRepository;
  }

  public execute(): ProductOutput[] | Error {
    try {
      return this.productOutputRepository.listAll();
    } catch (error) {
      return new Error("Error listing product outputs");
    }
  }
}
