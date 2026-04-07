import Database from "better-sqlite3";
import { DeleteProductController } from "../../src/controllers/DeleteProductController";
import { DeleteProductUseCase } from "../../src/usecases/DeleteProductUseCase";
import { ProductRepository } from "../../src/repositories/ProductRepository";
import { SqliteConnection } from "../../src/repositories/SqliteConnection";

const DB_PATH = "db/estoque-testes.db";

const makeRequestMock = (params: object): any => ({
    params
});

const makeResponseMock = (): any => ({
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
});

const seedDatabase = (db: Database.Database) => {

    db.exec("DELETE FROM products;");

    db.exec(`
        INSERT INTO products (barcode, name, quantity_in_stock, order_reference_days)
        VALUES ('123', 'Product Test', 10, 7);
    `);
};

describe("DeleteProduct Integration Test", () => {

    let db: Database.Database;
    let controller: DeleteProductController;

    beforeEach(() => {
        db = new Database(DB_PATH);
        seedDatabase(db);

        const sqliteConnection = new SqliteConnection(DB_PATH);
        const productRepository = new ProductRepository(sqliteConnection);

        const deleteProductUseCase = new DeleteProductUseCase(productRepository);
        controller = new DeleteProductController(deleteProductUseCase);
    });

    afterEach(() => {
        db.exec("DELETE FROM products;");
        db.close();
    });

    test("should delete product successfully", async () => {
        const request = makeRequestMock({ barcode: "123" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(200);
        expect(response.data.message).toBe("Product deleted successfully");

        const deletedProduct = db.prepare("SELECT * FROM products WHERE barcode = ?").get("123");
        expect(deletedProduct).toBeUndefined();
    });

    test("should return 400 when barcode is missing", async () => {
        const request = makeRequestMock({});
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(400);
        expect(response.data.error).toBe("Product barcode is required");
    });

    test("should return 404 when product does not exist", async () => {
        const request = makeRequestMock({ barcode: "999" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(404);
        expect(response.data.error).toBe("Product not found");
    });

    test("should return 500 when an unexpected error occurs", async () => {

        const mockUseCase = {
            execute: jest.fn(() => {
                throw new Error("DB crash");
            })
        };

        const controller = new DeleteProductController(mockUseCase as any);

        const request = makeRequestMock({ barcode: "123" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(500);
        expect(response.data.error).toBe("Internal server error");
    });

});