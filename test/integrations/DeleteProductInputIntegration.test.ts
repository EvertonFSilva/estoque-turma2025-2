import Database from "better-sqlite3";
import { DeleteProductInputController } from "../../src/controllers/DeleteProductInputController";
import { DeleteProductInputUseCase } from "../../src/usecases/DeleteProductInputUsecase";
import { ProductInputRepository } from "../../src/repositories/ProductInputRepository";
import { ProductOrderRepository } from "../../src/repositories/ProductOrderRepository";
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
    db.exec("PRAGMA foreign_keys = OFF;");
    db.exec("DELETE FROM productInput;");
    db.exec("DELETE FROM productOrder;");
    db.exec("DELETE FROM products;");
    db.exec("PRAGMA foreign_keys = ON;");

    db.exec("INSERT INTO products (barcode, name, quantity_in_stock, order_reference_days) VALUES ('111', 'Test Product', 15, 7);");
    db.exec(`INSERT INTO productOrder (uuid, product_fk, quantity, orderDate, status) VALUES ('order-001', '111', 5, '2026-01-01T00:00:00.000Z', 'closed');`);
    db.exec(`INSERT INTO productInput (uuid, productOrder_fk, quantity, inputDate) VALUES ('input-001', 'order-001', 5, '2026-02-01T00:00:00.000Z');`);

    db.exec("INSERT INTO products (barcode, name, quantity_in_stock, order_reference_days) VALUES ('222', 'Edge Product', 5, 7);");
    db.exec(`INSERT INTO productOrder (uuid, product_fk, quantity, orderDate, status) VALUES ('order-002', '222', 5, '2026-01-01T00:00:00.000Z', 'closed');`);
    db.exec(`INSERT INTO productInput (uuid, productOrder_fk, quantity, inputDate) VALUES ('input-002', 'order-002', 5, '2026-02-01T00:00:00.000Z');`);

    db.exec("INSERT INTO products (barcode, name, quantity_in_stock, order_reference_days) VALUES ('333', 'Low Stock Product', 2, 7);");
    db.exec(`INSERT INTO productOrder (uuid, product_fk, quantity, orderDate, status) VALUES ('order-003', '333', 5, '2026-01-01T00:00:00.000Z', 'closed');`);
    db.exec(`INSERT INTO productInput (uuid, productOrder_fk, quantity, inputDate) VALUES ('input-003', 'order-003', 5, '2026-02-01T00:00:00.000Z');`);

    db.exec("PRAGMA foreign_keys = OFF;");
    db.exec(`INSERT INTO productOrder (uuid, product_fk, quantity, orderDate, status) VALUES ('order-orphan', 'NONEXISTENT', 5, '2026-01-01T00:00:00.000Z', 'closed');`);
    db.exec(`INSERT INTO productInput (uuid, productOrder_fk, quantity, inputDate) VALUES ('input-orphan', 'order-orphan', 5, '2026-02-01T00:00:00.000Z');`);
    db.exec("PRAGMA foreign_keys = ON;");
};

describe("DeleteProductInput Integration Test", () => {

    let db: Database.Database;
    let controller: DeleteProductInputController;

    beforeEach(() => {
        db = new Database(DB_PATH);
        seedDatabase(db);

        const sqliteConnection = new SqliteConnection(DB_PATH);
        const productRepository = new ProductRepository(sqliteConnection);
        const productOrderRepository = new ProductOrderRepository(sqliteConnection, productRepository);
        const productInputRepository = new ProductInputRepository(sqliteConnection);
        const deleteProductInputUseCase = new DeleteProductInputUseCase(
            productInputRepository,
            productOrderRepository,
            productRepository
        );
        controller = new DeleteProductInputController(deleteProductInputUseCase);
    });

    afterEach(() => {
        db.exec("PRAGMA foreign_keys = OFF;");
        db.exec("DELETE FROM productInput;");
        db.exec("DELETE FROM productOrder;");
        db.exec("DELETE FROM products;");
        db.exec("PRAGMA foreign_keys = ON;");
        db.close();
    });

    // Caminho feliz - deletar product input, atualizar estoque e reabrir pedido
    test("should delete product input, update stock and reopen order successfully", async () => {
        const request = makeRequestMock({ productInputId: "input-001" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(200);
        expect(response.data.message).toBe("Product input deleted successfully");

        const deletedInput = db.prepare("SELECT * FROM productInput WHERE uuid = ?").get("input-001");
        expect(deletedInput).toBeUndefined();

        const updatedProduct = db.prepare("SELECT * FROM products WHERE barcode = ?").get("111") as any;
        expect(updatedProduct.quantity_in_stock).toBe(10);

        const updatedOrder = db.prepare("SELECT * FROM productOrder WHERE uuid = ?").get("order-001") as any;
        expect(updatedOrder.status).toBe("opened");
    });

    test("should allow deletion when stock equals input quantity (resulting in zero stock)", async () => {
        const request = makeRequestMock({ productInputId: "input-002" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(200);

        const updatedProduct = db.prepare("SELECT * FROM products WHERE barcode = ?").get("222") as any;
        expect(updatedProduct.quantity_in_stock).toBe(0);
    });

    // Caminhos tristes
    test("should return 400 when productInputId is missing", async () => {
        const request = makeRequestMock({});
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(400);
        expect(response.data.error).toBe("Product input ID is required");
    });

    test("should return 404 when product input is not found", async () => {
        const request = makeRequestMock({ productInputId: "non-existent-input" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(404);
        expect(response.data.error).toBe("Product input not found");
    });

    test("should return 400 when deletion would result in negative stock", async () => {
        const request = makeRequestMock({ productInputId: "input-003" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(400);
        expect(response.data.error).toBe("Cannot delete product input as it would result in negative stock");

        // Verificar que nada foi alterado
        const input = db.prepare("SELECT * FROM productInput WHERE uuid = ?").get("input-003");
        expect(input).toBeDefined();

        const product = db.prepare("SELECT * FROM products WHERE barcode = ?").get("333") as any;
        expect(product.quantity_in_stock).toBe(2);
    });

    test("should return 404 when product referenced by order is not found", async () => {
        const request = makeRequestMock({ productInputId: "input-orphan" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(404);
        expect(response.data.error).toBe("Product not found");
    });

    test("should return 500 when a database error occurs", async () => {
        db.exec("DROP TABLE IF EXISTS productInput;");

        const request = makeRequestMock({ productInputId: "input-001" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(500);
        expect(response.data.error).toBe("Internal server error");

        db.exec(`CREATE TABLE IF NOT EXISTS productInput (
            uuid TEXT PRIMARY KEY,
            productOrder_fk TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            inputDate TEXT NOT NULL,
            FOREIGN KEY (productOrder_fk) REFERENCES productOrder(uuid)
        );`);
    });
});
