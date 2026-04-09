import Product from '../../../src/entities/Product';
import ProductOutput from '../../../src/entities/ProductOutput';
import { GetProductOutputController } from '../../../src/controllers/GetProductOutputController';
import type { ProductOutputRepositoryInterface } from '../../../src/repositories/ProductOutputRepository';
import ProductOrder from '../../../src/entities/ProductOrder';

describe('GetProductOutputController', () => {
    test('should return 200 if product output is found successfully', async () => {
        class ProductOutputRepositoryMock implements ProductOutputRepositoryInterface {
            findByUuid(uuid: string): ProductOutput | null {
                const product = Product.rebuild('123456', 'Test Product', 50, 10);
                return ProductOutput.rebuild(uuid, product, 20, new Date('2026-01-29T00:00:00.000Z'));
            }

            listAll(): ProductOutput[] {
                return [];
            }

            save(productOutput: ProductOutput): void {}

            updateStatus(productOutput: ProductOutput): void {}

            delete(uuid: string): void {}
        }

        const productOutputRepository = new ProductOutputRepositoryMock();
        const controller = new GetProductOutputController(productOutputRepository);

        const requestMock: any = {
            params: {
                productOutputId: 'output-123',
            },
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
            },
        };

        await controller.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(200);
        expect(responseMock.data).toEqual({
            uuid: 'output-123',
            product: 'Test Product',
            productBarcode: '123456',
            quantity: 20,
            outputDate: new Date('2026-01-29T00:00:00.000Z'),
        });
    });

    test('should call repository with productOutputId from params', async () => {
        let receivedProductOutputId = '';

        class ProductOutputRepositoryMock implements ProductOutputRepositoryInterface {
            findByUuid(uuid: string): ProductOutput | null {
                receivedProductOutputId = uuid;
                const product = Product.rebuild('123456', 'Test Product', 50, 10);
                return ProductOutput.rebuild('output-xyz', product, 20, new Date('2026-01-29T00:00:00.000Z'));
            }

            listAll(): ProductOutput[] {
                return [];
            }

            save(productOutput: ProductOutput): void {}

            updateStatus(productOutput: ProductOutput): void {}

            delete(uuid: string): void {}
        }

        const productOutputRepository = new ProductOutputRepositoryMock();
        const controller = new GetProductOutputController(productOutputRepository);

        const requestMock: any = {
            params: {
                productOutputId: 'output-abc-456',
            },
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
            },
        };

        await controller.handle(requestMock, responseMock);

        expect(receivedProductOutputId).toBe('output-abc-456');
        expect(responseMock.statusCode).toBe(200);
    });

    test('should return 404 if product output is not found', async () => {
        class ProductOutputRepositoryMock implements ProductOutputRepositoryInterface {
            findByUuid(uuid: string): ProductOutput | null {
                return null;
            }

            listAll(): ProductOutput[] {
                return [];
            }

            save(productOutput: ProductOutput): void {}

            updateStatus(productOutput: ProductOutput): void {}
            delete(uuid: string): void {}
        }

        const productOutputRepository = new ProductOutputRepositoryMock();
        const controller = new GetProductOutputController(productOutputRepository);

        const requestMock: any = {
            params: {
                productOutputId: 'output-999',
            },
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
            },
        };

        await controller.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(404);
        expect(responseMock.data).toEqual({
            message: 'Saída de produto não encontrada.',
        });
    });
});
