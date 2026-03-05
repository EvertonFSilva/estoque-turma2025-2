import Product from "../../../src/entities/Product";
import { ListProductsController } from "../../../src/controllers/ListProductsController";
import type { ListProductsUsecase } from "../../../src/usecases/ListProductsUsecase";
import type { ListProductsUsecaseInterface } from "../../../src/usecases/ListProductsUsecase";

describe("ListProductsController", () => {
  test("should return 200 with the list of products", async () => {
    class ListProductsUsecaseMock implements ListProductsUsecaseInterface {
      execute(): Product[] | Error {
        return [
          Product.rebuild("111", "P1", 5, 7),
          Product.rebuild("222", "P2", 0, 14),
        ];
      }
    }

    const usecase = new ListProductsUsecaseMock();
    const controller = new ListProductsController(usecase as ListProductsUsecase);

    const requestMock: any = {};
    const responseMock: any = {
      statusCode: 0,
      data: null,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      send(data: any) {
        this.data = data;
        return this;
      },
    };

    await controller.handle(requestMock, responseMock);

    expect(responseMock.statusCode).toBe(200);
    expect(responseMock.data).toEqual([
      {
        barcode: "111",
        name: "P1",
        quantityInStock: 5,
        orderReferenceDays: 7,
      },
      {
        barcode: "222",
        name: "P2",
        quantityInStock: 0,
        orderReferenceDays: 14,
      },
    ]);
  });

  test("should return 400 if the usecase returns an ERROR", async () => {
    class ListProductsUsecaseMock implements ListProductsUsecaseInterface {
      execute(): Product[] | Error {
        return new Error("Error listing products");
      }
    }

    const usecase = new ListProductsUsecaseMock();
    const controller = new ListProductsController(usecase as ListProductsUsecase);

    const requestMock: any = {};
    const responseMock: any = {
      statusCode: 0,
      data: null,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      send(data: any) {
        this.data = data;
        return this;
      },
    };

    await controller.handle(requestMock, responseMock);

    expect(responseMock.statusCode).toBe(400);
    expect(responseMock.data).toEqual({ message: "Error listing products" });
  });
});