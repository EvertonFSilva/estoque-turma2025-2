import Product from '../../../src/entities/Product';
import ProductOrder from '../../../src/entities/ProductOrder';
import { GetProductOrderController } from '../../../src/controllers/GetProductOrderController';
import type { ProductOrderRepositoryInterface } from '../../../src/repositories/ProductOrderRepository';

describe('GetProductOrderController', () => {
    test('should return 200 if product order is found successfully', async () => {
        class ProductOrderRepositoryMock implements ProductOrderRepositoryInterface {
            findByUuid(uuid: string): ProductOrder | null {
                const product = Product.rebuild('123456', 'Test Product', 50, 10);
                return ProductOrder.rebuild(uuid, product, 20, new Date('2026-01-29T00:00:00.000Z'), 'opened');
            }

            listAll(): ProductOrder[] {
                return [];
            }

            save(productOrder: ProductOrder): void {}

            updateStatus(productOrder: ProductOrder): void {}
        }

        const productOrderRepository = new ProductOrderRepositoryMock();
        const controller = new GetProductOrderController(productOrderRepository);

        const requestMock: any = {
            params: {
                productOrderId: 'order-123',
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
            uuid: 'order-123',
            product: 'Test Product',
            productBarcode: '123456',
            quantity: 20,
            orderDate: new Date('2026-01-29T00:00:00.000Z'),
            status: 'opened',
        });
    });

    test('should call repository with productOrderId from params', async () => {
        let receivedProductOrderId = '';

        class ProductOrderRepositoryMock implements ProductOrderRepositoryInterface {
            findByUuid(uuid: string): ProductOrder | null {
                receivedProductOrderId = uuid;
                const product = Product.rebuild('123456', 'Test Product', 50, 10);
                return ProductOrder.rebuild('order-xyz', product, 1, new Date('2026-01-29T00:00:00.000Z'), 'opened');
            }

            listAll(): ProductOrder[] {
                return [];
            }

            save(productOrder: ProductOrder): void {}

            updateStatus(productOrder: ProductOrder): void {}
        }

        const productOrderRepository = new ProductOrderRepositoryMock();
        const controller = new GetProductOrderController(productOrderRepository);

        const requestMock: any = {
            params: {
                productOrderId: 'order-abc-456',
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

        expect(receivedProductOrderId).toBe('order-abc-456');
        expect(responseMock.statusCode).toBe(200);
    });

    test('should return 404 if product order is not found', async () => {
        class ProductOrderRepositoryMock implements ProductOrderRepositoryInterface {
            findByUuid(uuid: string): ProductOrder | null {
                return null;
            }

            listAll(): ProductOrder[] {
                return [];
            }

            save(productOrder: ProductOrder): void {}

            updateStatus(productOrder: ProductOrder): void {}
        }

        const productOrderRepository = new ProductOrderRepositoryMock();
        const controller = new GetProductOrderController(productOrderRepository);

        const requestMock: any = {
            params: {
                productOrderId: 'order-999',
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
            message: 'Pedido não encontrado.',
        });
    });
});
