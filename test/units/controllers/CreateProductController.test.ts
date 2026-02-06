import Product from '../../../src/entities/Product';
import type { CreateProductUsecaseInterface } from '../../../src/usecases/CreateProductUsecase';
import { CreateProductController } from '../../../src/controllers/CreateProductController';

describe('CreateProductController', () => {
    test('should return 201 if the product is created successfully', async () => {

        class createProductUsecaseMock implements CreateProductUsecaseInterface {
            execute(barcode: string, name: string, orderReferenceDays: number): Product | Error {
                return Product.rebuild(barcode, name, 0, orderReferenceDays);
            }
        }

        const createProductUsecase = new createProductUsecaseMock();
        const createProductController = new CreateProductController(createProductUsecase);

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
    });

    test('should return 400 if the usecase return as an ERROR', async () => {

        class createProductUsecaseMock implements CreateProductUsecaseInterface {
            execute(barcode: string, name: string, orderReferenceDays: number): Product | Error {
                return new Error('Error creating product');
            }
        }

        const createProductUsecase = new createProductUsecaseMock();
        const createProductController = new CreateProductController(createProductUsecase);

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

        expect(responseMock.statusCode).toBe(400);
        expect(responseMock.data).toEqual({
            message: 'Error creating product'
        });
    });    
});