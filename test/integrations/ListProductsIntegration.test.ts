import { SqliteConnection } from "../../src/repositories/SqliteConnection";
import { ProductRepository } from "../../src/repositories/ProductRepository";
import { ListProductsUsecase } from "../../src/usecases/ListProductsUsecase";
import { ListProductsController } from "../../src/controllers/ListProductsController";

describe("List Products Integration Test", () => {
  test("should return all products successfully", async () => {
    const sqliteConnection = new SqliteConnection("db/estoque-testes.db");
    const productRepository = new ProductRepository(sqliteConnection);
    const usecase = new ListProductsUsecase(productRepository);
    const controller = new ListProductsController(usecase);

    const db = sqliteConnection.getConnection();
    db.exec("PRAGMA foreign_keys = OFF;");
    db.exec("DELETE FROM productOrder;");
    db.exec("DELETE FROM products;");
    db.exec("PRAGMA foreign_keys = ON;");

    db.exec(
      "insert into products (barcode, name, quantity_in_stock, order_reference_days) values ('111', 'Produto 1', 10, 7);"
    );
    db.exec(
      "insert into products (barcode, name, quantity_in_stock, order_reference_days) values ('222', 'Produto 2', 0, 14);"
    );

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
        name: "Produto 1",
        quantityInStock: 10,
        orderReferenceDays: 7,
      },
      {
        barcode: "222",
        name: "Produto 2",
        quantityInStock: 0,
        orderReferenceDays: 14,
      },
    ]);
  });
});