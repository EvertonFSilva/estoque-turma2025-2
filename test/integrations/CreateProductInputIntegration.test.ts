import Database from "better-sqlite3";
import { CreateProductInputController } from "../../src/controllers/CreateProductInputController";
import { CreateProductInputUseCase } from "../../src/usecases/CreateProductInputUseCase";
import { ProductInputRepository } from "../../src/repositories/ProductInputRepository";
import { ProductOrderRepository } from "../../src/repositories/ProductOrderRepository";
import { ProductRepository } from "../../src/repositories/ProductRepository";
import { SqliteConnection } from "../../src/repositories/SqliteConnection";

const DB_PATH = "db/estoque-testes.db";

const makeRequestMock = (body: object): any => ({
    body
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

    db.exec("INSERT INTO products (barcode, name, quantity_in_stock, order_reference_days) VALUES ('111', 'Test Product', 10, 7);");
    db.exec(`INSERT INTO productOrder (uuid, product_fk, quantity, orderDate, status) VALUES ('order-001', '111', 5, '2026-01-01T00:00:00.000Z', 'opened');`);
    db.exec(`INSERT INTO productOrder (uuid, product_fk, quantity, orderDate, status) VALUES ('order-closed', '111', 5, '2026-01-01T00:00:00.000Z', 'closed');`);
    db.exec("PRAGMA foreign_keys = OFF;");
    db.exec(`INSERT INTO productOrder (uuid, product_fk, quantity, orderDate, status) VALUES ('order-orphan', 'NONEXISTENT', 5, '2026-01-01T00:00:00.000Z', 'opened');`);
    db.exec("PRAGMA foreign_keys = ON;");
};

describe("CreateProductInput Integration Test", () => {

    let db: Database.Database;
    let controller: CreateProductInputController;

    beforeEach(() => {
        db = new Database(DB_PATH);
        seedDatabase(db);
        
        const sqliteConnection = new SqliteConnection(DB_PATH);
        const productRepository = new ProductRepository(sqliteConnection);
        const productOrderRepository = new ProductOrderRepository(sqliteConnection, productRepository);
        const productInputRepository = new ProductInputRepository(sqliteConnection);
        const createProductInputUseCase = new CreateProductInputUseCase(
            productInputRepository,
            productOrderRepository,
            productRepository
        );
        controller = new CreateProductInputController(createProductInputUseCase);
    });

    afterEach(() => {
        db.exec("PRAGMA foreign_keys = OFF;");
        db.exec("DELETE FROM productInput;");
        db.exec("DELETE FROM productOrder;");
        db.exec("DELETE FROM products;");
        db.exec("PRAGMA foreign_keys = ON;");
        db.close();
    });

    // Sucesso
    test("should create a product input and update stock successfully", async () => {
        const request = makeRequestMock({
            productOrderId: "order-001",
            quantity: 5,
            inputDate: "2026-02-01T00:00:00.000Z"
        });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(201);
        expect(response.data.productOrderId).toBe("order-001");
        expect(response.data.productInputQuantity).toBe(5);
        expect(response.data.productOrderStatus).toBe("closed");
        expect(response.data.productBarcode).toBe("111");
        expect(response.data.productName).toBe("Test Product");
        expect(response.data.productStock).toBe(15);

        const updatedProduct = db.prepare("SELECT * FROM products WHERE barcode = ?").get("111") as any;
        expect(updatedProduct.quantity_in_stock).toBe(15);

        const updatedOrder = db.prepare("SELECT * FROM productOrder WHERE uuid = ?").get("order-001") as any;
        expect(updatedOrder.status).toBe("closed");

        const createdInput = db.prepare("SELECT * FROM productInput WHERE productOrder_fk = ?").get("order-001") as any;
        expect(createdInput).toBeDefined();
        expect(createdInput.quantity).toBe(5);
    });

    // Validações de entrada
    test("should return 400 when productOrderId is missing", async () => {
        const request = makeRequestMock({ quantity: 5, inputDate: "2026-02-01T00:00:00.000Z" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(400);
        expect(response.data.error).toBe("Product order ID is required");
    });

    test("should return 400 when quantity is missing", async () => {
        const request = makeRequestMock({ productOrderId: "order-001", inputDate: "2026-02-01T00:00:00.000Z" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(400);
        expect(response.data.error).toBe("Quantity must be a positive number");
    });

    test("should return 400 when quantity is zero", async () => {
        const request = makeRequestMock({ productOrderId: "order-001", quantity: 0, inputDate: "2026-02-01T00:00:00.000Z" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(400);
        expect(response.data.error).toBe("Quantity must be a positive number");
    });

    test("should return 400 when quantity is negative", async () => {
        const request = makeRequestMock({ productOrderId: "order-001", quantity: -3, inputDate: "2026-02-01T00:00:00.000Z" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(400);
        expect(response.data.error).toBe("Quantity must be a positive number");
    });

    test("should return 400 when inputDate is missing", async () => {
        const request = makeRequestMock({ productOrderId: "order-001", quantity: 5 });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(400);
        expect(response.data.error).toBe("Input date is required");
    });

    test("should return 400 when inputDate has invalid format", async () => {
        const request = makeRequestMock({ productOrderId: "order-001", quantity: 5, inputDate: "invalid-date" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(400);
        expect(response.data.error).toBe("Invalid input date format");
    });

    // Regras de negócio
    test("should return 404 when productOrder is not found", async () => {
        const request = makeRequestMock({ productOrderId: "non-existent-order", quantity: 5, inputDate: "2026-02-01T00:00:00.000Z" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(404);
        expect(response.data.error).toBe("Product order not found");
    });

    test("should return 400 when productOrder status is not opened", async () => {
        const request = makeRequestMock({ productOrderId: "order-closed", quantity: 5, inputDate: "2026-02-01T00:00:00.000Z" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(400);
        expect(response.data.error).toBe("Product order is not in opened status");
    });

    test("should return 400 when inputDate is before orderDate", async () => {
        const request = makeRequestMock({ productOrderId: "order-001", quantity: 5, inputDate: "2025-12-31T00:00:00.000Z" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(400);
        expect(response.data.error).toBe("Input date cannot be before the product order date");
    });

    test("should return 404 when product referenced by productOrder is not found", async () => {
        const request = makeRequestMock({ productOrderId: "order-orphan", quantity: 5, inputDate: "2026-02-01T00:00:00.000Z" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(404);
        expect(response.data.error).toBe("Product not found");
    });

    test("should return 500 when a database error occurs", async () => {
        db.exec("DROP TABLE IF EXISTS productInput;");

        const request = makeRequestMock({ productOrderId: "order-001", quantity: 5, inputDate: "2026-02-01T00:00:00.000Z" });
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
