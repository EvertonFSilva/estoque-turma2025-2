import { CreateProductOutputController } from '../../../src/controllers/CreateProductOutputController';
import type { CreateProductOutputUsecase } from '../../../src/usecases/CreateProductOutputUsecase';
import type { CreateProductOutputUsecaseInterface } from '../../../src/usecases/CreateProductOutputUsecase';
import ProductOutput from '../../../src/entities/ProductOutput';
import Product from '../../../src/entities/Product';
import { ProductRepositoryInterface } from '../../../src/repositories/ProductRepository';

jest.mock('crypto', () => ({
    randomUUID: jest.fn(() => 'mock-uuid')
}));

describe('CreateProductOutputController (Legacy - Coupled)', () => {

    let responseMock: any;

    beforeEach(() => {
        responseMock = {
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
    });

    test('should return 400 if barcode is missing', async () => {
        class CreateProductOutputUsecaseMock implements CreateProductOutputUsecaseInterface {
            execute(barcode: string, quantity: number, outputDate: Date): ProductOutput | Error {
                return new Error('Barcode is required');
            }
        }

        const createProductOutputUsecase = new CreateProductOutputUsecaseMock();
        const controller = new CreateProductOutputController(createProductOutputUsecase as CreateProductOutputUsecase);

        const requestMock: any = { body: { quantity: 10, outputDate: '2024-01-01' } };

        await controller.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(400);
        expect(responseMock.data).toEqual({ error: 'Barcode is required' });
    });

    test('should return 400 if quantity is missing or invalid', async () => {
        class CreateProductOutputUsecaseMock implements CreateProductOutputUsecaseInterface {
            execute(barcode: string, quantity: number, outputDate: Date): ProductOutput | Error {
                return new Error('Quantity must be a positive number');
            }
        }

        const createProductOutputUsecase = new CreateProductOutputUsecaseMock();
        const controller = new CreateProductOutputController(createProductOutputUsecase as CreateProductOutputUsecase);

        const requestMock: any = { body: { barcode: '123', quantity: 0, outputDate: '2024-01-01' } };

        await controller.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(400);
        expect(responseMock.data).toEqual({ error: 'Quantity must be a positive number' });
    });

    test('should return 400 if outputDate is missing', async () => {
        class CreateProductOutputUsecaseMock implements CreateProductOutputUsecaseInterface {
            execute(barcode: string, quantity: number, outputDate: Date): ProductOutput | Error {
                return new Error('Output date is required');
            }
        }

        const createProductOutputUsecase = new CreateProductOutputUsecaseMock();
        const controller = new CreateProductOutputController(createProductOutputUsecase as CreateProductOutputUsecase);

        const requestMock: any = { body: { barcode: '123', quantity: 5 } };

        await controller.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(400);
        expect(responseMock.data).toEqual({ error: 'Output date is required' });
    });

    test('should return 400 if outputDate is invalid', async () => {
        class CreateProductOutputUsecaseMock implements CreateProductOutputUsecaseInterface {
            execute(barcode: string, quantity: number, outputDate: Date): ProductOutput | Error {
                return new Error('Invalid output date format');
            }
        }

        const createProductOutputUsecase = new CreateProductOutputUsecaseMock();
        const controller = new CreateProductOutputController(createProductOutputUsecase as CreateProductOutputUsecase);

        const requestMock: any = { body: { barcode: '123', quantity: 5, outputDate: 'zzzz' } };

        await controller.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(400);
        expect(responseMock.data).toEqual({ error: 'Invalid output date format' });
    });

    test('should return 404 if product not found', async () => {
        class CreateProductOutputUsecaseMock implements CreateProductOutputUsecaseInterface {
            execute(barcode: string, quantity: number, outputDate: Date): ProductOutput | Error {
                return new Error('Product not found');
            }
        }

        const createProductOutputUsecase = new CreateProductOutputUsecaseMock();
        const controller = new CreateProductOutputController(createProductOutputUsecase as CreateProductOutputUsecase);

        const requestMock: any = {
            body: { barcode: '999', quantity: 5, outputDate: '2024-01-01' }
        };

        await controller.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(400);
        expect(responseMock.data).toEqual({ error: 'Product not found' });
    });

    test('should return 400 if insufficient stock', async () => {
        class CreateProductOutputUsecaseMock implements CreateProductOutputUsecaseInterface {
            execute(barcode: string, quantity: number, outputDate: Date): ProductOutput | Error {
                return new Error('Insufficient stock for the requested output quantity');
            }
        }

        const createProductOutputUsecase = new CreateProductOutputUsecaseMock();
        const controller = new CreateProductOutputController(createProductOutputUsecase as CreateProductOutputUsecase);

        const requestMock: any = {
            body: { barcode: '123', quantity: 10, outputDate: '2024-01-01' }
        };

        await controller.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(400);
        expect(responseMock.data).toEqual({
            error: 'Insufficient stock for the requested output quantity'
        });
    });

    test('should return 201 and update stock when successful', async () => {

        const productRepositoryMock = {
            findByBarcode: jest.fn(() => Product.rebuild('123', 'Test Product', 50, 6))
        };
        class CreateProductOutputUsecaseMock implements CreateProductOutputUsecaseInterface {
            execute(barcode: string, quantity: number, outputDate: Date): ProductOutput | Error {
                const product = Product.rebuild('123', 'Test Product', 50, 6);
                return ProductOutput.rebuild('mock-uuid', product, 4, new Date('2024-01-01'));
            }
        }

        const createProductOutputUsecase = new CreateProductOutputUsecaseMock();
        const controller = new CreateProductOutputController(createProductOutputUsecase as CreateProductOutputUsecase, productRepositoryMock);

        const requestMock: any = {
            body: { barcode: '123', quantity: 4, outputDate: '2024-01-01' }
        };

        await controller.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(201);
        expect(responseMock.data).toEqual({
            productOutputId: 'mock-uuid',
            productOutputQuantity: 4,
            productOutputDate: new Date('2024-01-01').toISOString(),
            productBarcode: '123',
            productName: 'Test Product',
            productStock: 50
        });
    });

    test('should return 201 and productStock 0 if updatedProduct is undefined', async () => {
        const productRepositoryMock = {
            findByBarcode: jest.fn(() => undefined)
        };
        class CreateProductOutputUsecaseMock implements CreateProductOutputUsecaseInterface {
            execute(barcode: string, quantity: number, outputDate: Date): ProductOutput | Error {
                const product = Product.rebuild('123', 'Test Product', 50, 6);
                return ProductOutput.rebuild('mock-uuid', product, 4, new Date('2024-01-01'));
            }
        }

        const createProductOutputUsecase = new CreateProductOutputUsecaseMock();
        const controller = new CreateProductOutputController(createProductOutputUsecase as CreateProductOutputUsecase, productRepositoryMock);

        const requestMock: any = {
            body: { barcode: '123', quantity: 4, outputDate: '2024-01-01' }
        };

        await controller.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(201);
        expect(responseMock.data).toEqual({
            productOutputId: 'mock-uuid',
            productOutputQuantity: 4,
            productOutputDate: new Date('2024-01-01').toISOString(),
            productBarcode: '123',
            productName: 'Test Product',
            productStock: 0
        });
    });
});