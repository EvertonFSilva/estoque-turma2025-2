import Product from "../entities/Product";
import type { ProductRepositoryInterface } from "../repositories/ProductRepository";

export interface ListProductsUsecaseInterface {
  execute(): Product[] | Error;
}

export class ListProductsUsecase implements ListProductsUsecaseInterface {
  private productRepository: ProductRepositoryInterface;

  constructor(productRepository: ProductRepositoryInterface) {
    this.productRepository = productRepository;
  }

  public execute(): Product[] | Error {
    try {
      const products = this.productRepository.listAll();
      return products;
    } catch (error) {
      return new Error("Error listing products");
    }
  }
}