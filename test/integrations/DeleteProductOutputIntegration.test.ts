import Product from "../../src/entities/Product";
import ProductOutput from "../../src/entities/ProductOutput";
import { SqliteConnection } from "../../src/repositories/SqliteConnection";
import { ProductRepository } from "../../src/repositories/ProductRepository";
import { ProductOutputRepository } from "../../src/repositories/ProductOutputRepository";
import { CreateProductOutputUsecase } from "../../src/usecases/CreateProductOutputUsecase";
import { DeleteProductOutputUseCase } from "../../src/usecases/DeleteProductOutputUsecase";
import { CreateProductOutputController } from "../../src/controllers/CreateProductOutputController";
import { DeleteProductOutputController } from "../../src/controllers/DeleteProductOutputController";

describe('Delete Product Output Integration Test', () => {

    let sqliteConnection: SqliteConnection;
    let productRepository: ProductRepository;
    let productOutputRepository: ProductOutputRepository;
    let createProductOutputUsecase: CreateProductOutputUsecase;
    let deleteProductOutputUsecase: DeleteProductOutputUseCase;
    let createProductOutputController: CreateProductOutputController;
    let deleteProductOutputController: DeleteProductOutputController;

    beforeEach(() => {
        sqliteConnection = new SqliteConnection("db/estoque-testes.db");
        productRepository = new ProductRepository(sqliteConnection);
        productOutputRepository = new ProductOutputRepository(sqliteConnection, productRepository);
        createProductOutputUsecase = new CreateProductOutputUsecase(productOutputRepository, productRepository);
        deleteProductOutputUsecase = new DeleteProductOutputUseCase(productOutputRepository, productRepository);
        createProductOutputController = new CreateProductOutputController(createProductOutputUsecase, productRepository);
        deleteProductOutputController = new DeleteProductOutputController(deleteProductOutputUsecase);

        const db = sqliteConnection.getConnection();

        db.exec("PRAGMA foreign_keys = OFF;");
        db.exec("DELETE FROM productOutput;");
        db.exec("DELETE FROM products;");
        db.exec("PRAGMA foreign_keys = ON;");

        db.exec("INSERT INTO products (barcode, name, quantity_in_stock, order_reference_days) VALUES ('123456', 'Test Product', 200, 0);");
    });

    test('should delete a product output and restore stock', async () => {
        const outputDate = new Date('2024-03-15T10:00:00.000Z');

        const requestCreate: any = {
            body: {
                barcode: '123456',
                quantity: 5,
                outputDate: outputDate.toISOString()
            }
        };

        const responseCreate: any = {
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

        await createProductOutputController.handle(requestCreate, responseCreate);

        const productOutputId = responseCreate.data.productOutputId;

        let product = productRepository.findByBarcode('123456');
        expect(product?.getQuantityInStock()).toBe(195); // 200 - 5

        const requestDelete: any = { params: { productOutputId } };
        const responseDelete: any = {
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

        await deleteProductOutputController.handle(requestDelete, responseDelete);

        expect(responseDelete.statusCode).toBe(200);
        expect(responseDelete.data).toEqual({
            message: "Product output deleted successfully"
        });

        const db = sqliteConnection.getConnection();
        const dbResult = db.prepare("SELECT * FROM productOutput WHERE uuid = ?").get(productOutputId);
        expect(dbResult).toBeUndefined();

        product = productRepository.findByBarcode('123456');
        expect(product?.getQuantityInStock()).toBe(200);

        const outputSaved = productOutputRepository.findByUuid(productOutputId);
        expect(outputSaved).toBeNull();
    });

});