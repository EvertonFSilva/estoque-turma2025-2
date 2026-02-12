import Product from "../../src/entities/Product";
import { SqliteConnection } from "../../src/repositories/SqliteConnection";
import { ProductRepository } from "../../src/repositories/ProductRepository";
import { GetProductUsecase } from "../../src/usecases/GetProductUsecase";
import { GetProductController } from "../../src/controllers/GetProductController";

describe("Get Product Integration Test", () => {

    test("should return a product successfully", async () => {

        const sqliteConnection = new SqliteConnection("db/estoque-testes.db");
        const productRepository = new ProductRepository(sqliteConnection);
        const usecase = new GetProductUsecase(productRepository);
        const controller = new GetProductController(usecase);

        const db = sqliteConnection.getConnection();
        db.exec("PRAGMA foreign_keys = OFF;");
        db.exec("DELETE FROM productOrder;");
        db.exec("DELETE FROM products;");
        db.exec("PRAGMA foreign_keys = ON;");
        db.exec("insert into products (barcode, name, quantity_in_stock, order_reference_days) values ('123999', 'Produto Consulta', 10, 7);");

        const requestMock: any = {
            body: {
                barcode: "123999"
            }
        };

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
            }
        };

        await controller.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(200);
        expect(responseMock.data).toEqual({
            barcode: "123999",
            name: "Produto Consulta",
            quantityInStock: 10,
            orderReferenceDays: 7
        });
    });
});