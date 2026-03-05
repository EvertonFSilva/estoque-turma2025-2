import Product from "../../src/entities/Product";
import { SqliteConnection } from "../../src/repositories/SqliteConnection";
import { ProductRepository } from "../../src/repositories/ProductRepository";
import { ProductOutputRepository } from "../../src/repositories/ProductOutputRepository";
import { CreateProductOutputUsecase } from "../../src/usecases/CreateProductOutputUsecase";
import { CreateProductOutputController } from "../../src/controllers/CreateProductOutputController";

describe('Create Product Output Integration Test - Happy Path', () => {

    let sqliteConnection: SqliteConnection;
    let productRepository: ProductRepository;
    let productOutputRepository: ProductOutputRepository;
    let createProductOutputUsecase: CreateProductOutputUsecase;
    let createProductOutputController: CreateProductOutputController;

    beforeEach(() => {
        sqliteConnection = new SqliteConnection("db/estoque-testes.db");
        productRepository = new ProductRepository(sqliteConnection);
        productOutputRepository = new ProductOutputRepository(sqliteConnection, productRepository);
        createProductOutputUsecase = new CreateProductOutputUsecase(productOutputRepository, productRepository);
        createProductOutputController = new CreateProductOutputController(createProductOutputUsecase, productRepository);

        const db = sqliteConnection.getConnection();
        
        // Limpa o banco de dados
        db.exec("PRAGMA foreign_keys = OFF;");
        db.exec("DELETE FROM productOutput;");
        db.exec("DELETE FROM products;");
        db.exec("PRAGMA foreign_keys = ON;");
        db.exec("insert into products (barcode, name, quantity_in_stock, order_reference_days) values ('123456', 'Test Product', 200, 0);");
    });

    test('should create a new product output successfully', async () => {
        // Arrange: Cria um produto no banco usando o repository

        const outputDate = new Date('2024-03-15T10:00:00.000Z');

        const requestMock: any = {
            body: {
                barcode: '123456',
                quantity: 5,
                outputDate: outputDate.toISOString()
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

        // Act: Executa o controller
        await createProductOutputController.handle(requestMock, responseMock);

        // Assert: Verifica a resposta
        expect(responseMock.statusCode).toBe(201);
        expect(responseMock.data).toMatchObject({
            productOutputId: expect.any(String),
            productOutputQuantity: 5,
            productOutputDate: outputDate.toISOString(),
            productBarcode: '123456',
            productName: 'Test Product',
            productStock: 195 // 200 - 5
        });

        // Verifica que o registro foi criado no banco
        const db = sqliteConnection.getConnection();
        const dbResult = db.prepare("SELECT * FROM productOutput WHERE product_fk = ?").get('123456') as any;

        expect(dbResult).toBeDefined();
        expect(dbResult.quantity).toBe(5);

        // Verifica que o estoque foi atualizado
        const updatedProduct = productRepository.findByBarcode('123456');
        expect(updatedProduct?.getQuantityInStock()).toBe(195);

        // Verifica que pode recuperar o ProductOutput do repository
        const savedOutput = productOutputRepository.findByUuid(responseMock.data.productOutputId);
        expect(savedOutput).toBeDefined();
        expect(savedOutput?.getQuantity()).toBe(5);
    });

});