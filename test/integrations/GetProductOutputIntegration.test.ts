import Database from "better-sqlite3";
import { SqliteConnection } from "../../src/repositories/SqliteConnection";
import { ProductRepository } from "../../src/repositories/ProductRepository";
import { ProductOutputRepository } from "../../src/repositories/ProductOutputRepository";
import { GetProductOutputController } from "../../src/controllers/GetProductOutputController";

const DB_PATH = "db/estoque-testes.db";

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
    db.exec("PRAGMA foreign_keys = OFF;");
    db.exec("DELETE FROM productOutput;");
    db.exec("DELETE FROM productInput;");
    db.exec("DELETE FROM productOrder;");
    db.exec("DELETE FROM products;");
    db.exec("PRAGMA foreign_keys = ON;");

    db.exec("INSERT INTO products (barcode, name, quantity_in_stock, order_reference_days) VALUES ('111', 'Test Product', 10, 7);");
    db.exec("INSERT INTO productOutput (uuid, product_fk, quantity, outputDate) VALUES ('output-001', '111', 5, '2026-02-01T00:00:00.000Z');");
};

describe("GetProductOutput Integration Test", () => {

    let db: Database.Database;
    let controller: GetProductOutputController;

    beforeEach(() => {
        db = new Database(DB_PATH);
        seedDatabase(db);

        const sqliteConnection = new SqliteConnection(DB_PATH);
        const productRepository = new ProductRepository(sqliteConnection);
        const productOutputRepository = new ProductOutputRepository(sqliteConnection, productRepository);
        controller = new GetProductOutputController(productOutputRepository);
    });

    afterEach(() => {
        db.exec("PRAGMA foreign_keys = OFF;");
        db.exec("DELETE FROM productOutput;");
        db.exec("DELETE FROM productInput;");
        db.exec("DELETE FROM productOrder;");
        db.exec("DELETE FROM products;");
        db.exec("PRAGMA foreign_keys = ON;");
        db.close();
    });

    test("should return a product output successfully", async () => {
        const requestMock: any = {
            params: {
                productOutputId: "output-001"
            }
        };
        const response = makeResponseMock();

        await controller.handle(requestMock, response);

        expect(response.statusCode).toBe(200);
        expect(response.data).toEqual({
            uuid: "output-001",
            product: "Test Product",
            productBarcode: "111",
            quantity: 5,
            outputDate: new Date("2026-02-01T00:00:00.000Z")
        });
    });

    test("should return 404 when product output is not found", async () => {
        const requestMock: any = {
            params: {
                productOutputId: "nonexistent-uuid"
            }
        };
        const response = makeResponseMock();

        await controller.handle(requestMock, response);

        expect(response.statusCode).toBe(404);
        expect(response.data).toEqual({
            message: "Saída de produto não encontrada."
        });
    });
});
