import Product from "../../src/entities/Product";
import { SqliteConnection } from "../../src/repositories/SqliteConnection";
import { ProductRepository } from "../../src/repositories/ProductRepository";
import { CreateProductUsecase } from "../../src/usecases/CreateProductUsecase";
import { CreateProductController } from "../../src/controllers/CreateProductController";
import { create } from "domain";

describe('Create Product Integration Test', () => {

    test('should create a new product successfully', async () => {

        const sqliteConnection = new SqliteConnection("db/estoque-testes.db");
        const productRepository = new ProductRepository(sqliteConnection);
        const createProductUsecase = new CreateProductUsecase(productRepository);
        const createProductController = new CreateProductController(createProductUsecase);

        sqliteConnection.getConnection().exec("DELETE FROM products");

        expect(productRepository.findByBarcode('123456')).toBeNull();

        const requestMock: any = {
            body: {
                barcode: '123456',
                name: 'Test Product',
                orderReferenceDays: 10
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

        await createProductController.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(201);
        expect(responseMock.data).toEqual({
            barcode: '123456',
            name: 'Test Product',
            quantityInStock: 0,
            orderReferenceDays: 10
        });

        const product = productRepository.findByBarcode('123456');
        expect(product).toBeInstanceOf(Product);
        expect(product).not.toBeNull();
        if (product instanceof Product){
            expect(product.getBarcode()).toBe('123456');
            expect(product.getName()).toBe('Test Product');
            expect(product.getQuantityInStock()).toBe(0);
            expect(product.getOrderReferenceDays()).toBe(10);
        }

    });

});