import Product from "../../../src/entities/Product";
import type { ProductRepositoryInterface } from "../../../src/repositories/ProductRepository";
import { ListProductsUsecase } from "../../../src/usecases/ListProductsUsecase";

describe("ListProductsUsecase", () => {
  test("should list products successfully", async () => {
    class ProductRepositoryMock implements ProductRepositoryInterface {
      findByBarcode(_barcode: string): Product | null {
        return null;
      }
      listAll(): Product[] {
        return [
          Product.rebuild("111", "P1", 5, 7),
          Product.rebuild("222", "P2", 0, 14),
        ];
      }
      createProduct(_product: Product): boolean {
        return true;
      }
    }

    const repo = new ProductRepositoryMock();
    const usecase = new ListProductsUsecase(repo);

    const result = usecase.execute();

    expect(Array.isArray(result)).toBe(true);
    if (Array.isArray(result)) {
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Product);
      expect(result[0].getBarcode()).toBe("111");
      expect(result[1].getBarcode()).toBe("222");
    }
  });

  test("should return ERROR if repository throws an error", async () => {
    class ProductRepositoryMock implements ProductRepositoryInterface {
      findByBarcode(_barcode: string): Product | null {
        return null;
      }
      listAll(): Product[] {
        throw new Error("DB error");
      }
      createProduct(_product: Product): boolean {
        return true;
      }
    }

    const repo = new ProductRepositoryMock();
    const usecase = new ListProductsUsecase(repo);

    const result = usecase.execute();
    expect(result).toBeInstanceOf(Error);
    if (result instanceof Error) {
      expect(result.message).toBe("Error listing products");
    }
  });
});