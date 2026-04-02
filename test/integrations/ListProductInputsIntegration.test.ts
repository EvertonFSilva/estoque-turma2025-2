import Database from "better-sqlite3";
import { SqliteConnection } from "../../src/repositories/SqliteConnection";
import { ProductRepository } from "../../src/repositories/ProductRepository";
import { ProductOrderRepository } from "../../src/repositories/ProductOrderRepository";
import { ProductInputRepository } from "../../src/repositories/ProductInputRepository";
import { ListProductInputsUsecase } from "../../src/usecases/ListProductInputsUsecase";
import { ListProductInputsController } from "../../src/controllers/ListProductInputsController";

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
    db.exec("DELETE FROM productInput;");
    db.exec("DELETE FROM productOrder;");
    db.exec("DELETE FROM products;");
    db.exec("PRAGMA foreign_keys = ON;");

    db.exec("INSERT INTO products (barcode, name, quantity_in_stock, order_reference_days) VALUES ('111', 'Test Product', 10, 7);");
    db.exec(`INSERT INTO productOrder (uuid, product_fk, quantity, orderDate, status) VALUES ('order-001', '111', 5, '2026-01-01T00:00:00.000Z', 'closed');`);
    db.exec(`INSERT INTO productOrder (uuid, product_fk, quantity, orderDate, status) VALUES ('order-002', '111', 3, '2026-01-15T00:00:00.000Z', 'closed');`);
    db.exec(`INSERT INTO productInput (uuid, productOrder_fk, quantity, inputDate) VALUES ('input-001', 'order-001', 5, '2026-02-01T00:00:00.000Z');`);
    db.exec(`INSERT INTO productInput (uuid, productOrder_fk, quantity, inputDate) VALUES ('input-002', 'order-002', 3, '2026-02-15T00:00:00.000Z');`);
};

describe("ListProductInputs Integration Test", () => {

    let db: Database.Database;
    let controller: ListProductInputsController;

    beforeEach(() => {
        db = new Database(DB_PATH);
        seedDatabase(db);

        const sqliteConnection = new SqliteConnection(DB_PATH);
        const productInputRepository = new ProductInputRepository(sqliteConnection);
        const listProductInputsUsecase = new ListProductInputsUsecase(productInputRepository);
        controller = new ListProductInputsController(listProductInputsUsecase);
    });

    afterEach(() => {
        db.exec("PRAGMA foreign_keys = OFF;");
        db.exec("DELETE FROM productInput;");
        db.exec("DELETE FROM productOrder;");
        db.exec("DELETE FROM products;");
        db.exec("PRAGMA foreign_keys = ON;");
        db.close();
    });

    test("should return all product inputs successfully", async () => {
        const requestMock: any = {};
        const response = makeResponseMock();

        await controller.handle(requestMock, response);

        expect(response.statusCode).toBe(200);
        expect(response.data).toEqual([
            {
                uuid: "input-001",
                productOrderId: "order-001",
                quantity: 5,
                inputDate: "2026-02-01T00:00:00.000Z"
            },
            {
                uuid: "input-002",
                productOrderId: "order-002",
                quantity: 3,
                inputDate: "2026-02-15T00:00:00.000Z"
            }
        ]);
    });

    test("should return empty array when there are no product inputs", async () => {
        db.exec("DELETE FROM productInput;");

        const requestMock: any = {};
        const response = makeResponseMock();

        await controller.handle(requestMock, response);

        expect(response.statusCode).toBe(200);
        expect(response.data).toEqual([]);
    });
});
