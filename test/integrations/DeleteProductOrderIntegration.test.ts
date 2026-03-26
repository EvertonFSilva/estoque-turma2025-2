import Database from "better-sqlite3";
import { DeleteProductOrderController } from "../../src/controllers/DeleteProductOrderController";
import { DeleteProductOrderUseCase } from "../../src/usecases/DeleteProductOrderUseCase";
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

    // Product
    db.exec(`
        INSERT INTO products (barcode, name, quantity_in_stock, order_reference_days)
        VALUES ('111', 'Test Product', 10, 7);
    `);

    // Order WITHOUT input (can be deleted)
    db.exec(`
        INSERT INTO productOrder (uuid, product_fk, quantity, orderDate, status)
        VALUES ('order-001', '111', 5, '2026-01-01T00:00:00.000Z', 'opened');
    `);

    // Order WITH input (cannot be deleted)
    db.exec(`
        INSERT INTO productOrder (uuid, product_fk, quantity, orderDate, status)
        VALUES ('order-002', '111', 5, '2026-01-01T00:00:00.000Z', 'closed');
    `);

    db.exec(`
        INSERT INTO productInput (uuid, productOrder_fk, quantity, inputDate)
        VALUES ('input-001', 'order-002', 5, '2026-02-01T00:00:00.000Z');
    `);

};

describe("DeleteProductOrder Integration Test", () => {

    let db: Database.Database;
    let controller: DeleteProductOrderController;

    beforeEach(() => {
        db = new Database(DB_PATH);
        seedDatabase(db);

        const sqliteConnection = new SqliteConnection(DB_PATH);
        const productRepository = new ProductRepository(sqliteConnection);
        const productOrderRepository = new ProductOrderRepository(sqliteConnection, productRepository);
        const productInputRepository = new ProductInputRepository(sqliteConnection);
        const deleteProductOrdertUseCase = new DeleteProductOrderUseCase(
            productOrderRepository,
            productInputRepository,
        );

        controller = new DeleteProductOrderController(deleteProductOrdertUseCase);
    
    });

    afterEach(() => {
        db.exec("PRAGMA foreign_keys = OFF;");
        db.exec("DELETE FROM productInput;");
        db.exec("DELETE FROM productOrder;");
        db.exec("DELETE FROM products;");
        db.exec("PRAGMA foreign_keys = ON;");
        db.close();
    });

    // Caminho feliz - o produto foi deletado com sucesso
    test("should delete product order successfully", async () => {
        const request = makeRequestMock({ productOrderId: "order-001" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(200);
        expect(response.data.message).toBe("Product Order deleted successfully");

        const deletedOrder = db.prepare("SELECT * FROM productOrder WHERE uuid = ?").get("order-001");
        expect(deletedOrder).toBeUndefined();
    });

    //  Faltando o ID do produto
    test("should return 400 when productOrderId is missing", async () => {
        const request = makeRequestMock({});
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(400);
        expect(response.data.error).toBe("Product order ID is required");
    });

    // Product Order não existe
    test("should return 404 when product order does not exist", async () => {
        const request = makeRequestMock({ productOrderId: "order-003" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(404);
        expect(response.data.error).toBe("Product order not found");
    });

    //  Product Order tem Product Input
    test("should return 400 when order has associated product input", async () => {
        const request = makeRequestMock({ productOrderId: "order-002" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(400);
        expect(response.data.error).toBe("Cannot delete product order with associated product input");

        const order = db.prepare("SELECT * FROM productOrder WHERE uuid = ?").get("order-002");
        expect(order).toBeDefined(); // should NOT delete
    });

    //  DB error
    test("should return 500 when an unexpected error occurs", async () => {
        const mockUseCase = {
            execute: jest.fn(() => {
                throw new Error("Unexpected DB error");
            })
        };

        const controller = new DeleteProductOrderController(mockUseCase as any);

        const request = makeRequestMock({ productOrderId: "order-001" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(500);
        expect(response.data.error).toBe("Internal server error");
    });
    
});