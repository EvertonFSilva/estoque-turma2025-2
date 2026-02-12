import Product from "../../src/entities/Product";
import ProductOrder from "../../src/entities/ProductOrder";
import { SqliteConnection } from "../../src/repositories/SqliteConnection";
import { ProductRepository } from "../../src/repositories/ProductRepository";
import { ProductOrderRepository } from "../../src/repositories/ProductOrderRepository";
import { CreateProductOrderUsecase } from "../../src/usecases/CreateProductOrderUsecase";
import { CreateProductOrderController } from "../../src/controllers/CreateProductOrderController";

describe('Create Product Order Integration Test', () => {

    test('should create a new product order successfully', async () => {

        const sqliteConnection = new SqliteConnection("db/estoque-testes.db");
        const productRepository = new ProductRepository(sqliteConnection);
        const productOrderRepository = new ProductOrderRepository(sqliteConnection, productRepository);
        const createProductOrderUsecase = new CreateProductOrderUsecase(productOrderRepository, productRepository);
        const createProductOrderController = new CreateProductOrderController(createProductOrderUsecase);

        const db = sqliteConnection.getConnection();

        db.exec("PRAGMA foreign_keys = OFF;");
        db.exec("DELETE FROM productOrder;");
        db.exec("DELETE FROM products;");
        db.exec("PRAGMA foreign_keys = ON;");
        db.exec("insert into products (barcode, name, quantity_in_stock, order_reference_days) values ('123456', 'Test Product', 0, 10);");

        const product = Product.rebuild('123456', 'Test Product', 0, 10);

        const orderDate = new Date();

        const requestMock: any = {
            body: {
                barcode: '123456',
                quantity: 5,
                orderDate: orderDate
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

        await createProductOrderController.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(201);
        expect(responseMock.data.quantity).toBe(5);

        expect(responseMock.data.status).toBe('opened'); 
        expect(responseMock.data.product.getBarcode()).toBe('123456');

        const dbResult = db.prepare("SELECT * FROM productOrder WHERE product_fk = ?").get('123456') as any;

        expect(dbResult).toBeDefined();
        expect(dbResult.quantity).toBe(5);
        expect(dbResult.status).toBe('opened');

        const savedOrder = productOrderRepository.findByUuid(dbResult.uuid);
        expect(savedOrder).toBeInstanceOf(ProductOrder);
        expect(savedOrder?.getStatus()).toBe('opened');
    });

});