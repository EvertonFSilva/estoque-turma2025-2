import Database from "better-sqlite3";
import { SqliteConnection } from "../../src/repositories/SqliteConnection";
import { ProductRepository } from "../../src/repositories/ProductRepository";
import { ProductOutputRepository } from "../../src/repositories/ProductOutputRepository";
import { ListProductOutputsUsecase } from "../../src/usecases/ListProductOutputUsecase";
import { ListProductOutputController } from "../../src/controllers/ListProductOutputController";

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
    db.exec("INSERT INTO products (barcode, name, quantity_in_stock, order_reference_days) VALUES ('222', 'Another Product', 20, 5);");

    db.exec("INSERT INTO productOutput (uuid, product_fk, quantity, outputDate) VALUES ('output-001', '111', 2, '2026-03-01T00:00:00.000Z');");
    db.exec("INSERT INTO productOutput (uuid, product_fk, quantity, outputDate) VALUES ('output-002', '222', 4, '2026-03-15T00:00:00.000Z');");
};

describe("ListProductOutput Integration Test", () => {

    let db: Database.Database;
    let controller: ListProductOutputController;

    beforeEach(() => {
        db = new Database(DB_PATH);
        seedDatabase(db);

        const sqliteConnection = new SqliteConnection(DB_PATH);
        const productRepository = new ProductRepository(sqliteConnection);
        const productOutputRepository = new ProductOutputRepository(sqliteConnection, productRepository);
        const listProductOutputsUsecase = new ListProductOutputsUsecase(productOutputRepository);
        controller = new ListProductOutputController(listProductOutputsUsecase);
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

    test("should return all product outputs successfully", async () => {
        const requestMock: any = {};
        const response = makeResponseMock();

        await controller.handle(requestMock, response);

        expect(response.statusCode).toBe(200);
        expect(response.data).toEqual([
            {
                uuid: "output-001",
                product: "Test Product",
                quantity: 2,
                outputDate: new Date("2026-03-01T00:00:00.000Z")
            },
            {
                uuid: "output-002",
                product: "Another Product",
                quantity: 4,
                outputDate: new Date("2026-03-15T00:00:00.000Z")
            }
        ]);
    });

    test("should return empty array when there are no product outputs", async () => {
        db.exec("DELETE FROM productOutput;");

        const requestMock: any = {};
        const response = makeResponseMock();

        await controller.handle(requestMock, response);

        expect(response.statusCode).toBe(200);
        expect(response.data).toEqual([]);
    });
});
