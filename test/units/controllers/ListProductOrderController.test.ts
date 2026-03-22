import { describe, expect, test } from '@jest/globals';
import Product from '../../../src/entities/Product';
import ProductOrder from '../../../src/entities/ProductOrder';
import { ListProductOrderController } from '../../../src/controllers/ListProductOrderController';
import type { ListProductOrdersUsecase } from '../../../src/usecases/ListProductOrdersUsecase';

describe('ListProductOrderController', () => {
    test('should return 200 with the list of product orders', async () => {

        class ListProductOrdersUsecaseMock {
            execute(): ProductOrder[] | Error {
                const product = Product.rebuild('123456', 'Produto Teste', 10, 7);
                return [
                    ProductOrder.rebuild('order-1', product, 5, new Date('2026-01-10'), 'opened'),
                    ProductOrder.rebuild('order-2', product, 3, new Date('2026-01-11'), 'closed')
                ];
            }
        }

        const usecase = new ListProductOrdersUsecaseMock();
        const controller = new ListProductOrderController(usecase as ListProductOrdersUsecase);

        const requestMock: any = {};
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

        await controller.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(200);
        expect(responseMock.data).toEqual([
            {
                uuid: 'order-1',
                product: 'Produto Teste',
                quantity: 5,
                orderDate: new Date('2026-01-10'),
                status: 'opened'
            },
            {
                uuid: 'order-2',
                product: 'Produto Teste',
                quantity: 3,
                orderDate: new Date('2026-01-11'),
                status: 'closed'
            }
        ]);
    });

    test('should return 400 if usecase returns an ERROR', async () => {

        class ListProductOrdersUsecaseMock {
            execute(): ProductOrder[] | Error {
                return new Error('Error listing product orders');
            }
        }

        const usecase = new ListProductOrdersUsecaseMock();
        const controller = new ListProductOrderController(usecase as ListProductOrdersUsecase);

        const requestMock: any = {};
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

        await controller.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(400);
        expect(responseMock.data).toEqual({ message: 'Error listing product orders' });
    });

    test('should return 200 with empty array when usecase returns non-array value', async () => {

        class ListProductOrdersUsecaseMock {
            execute(): any {
                return null;
            }
        }

        const usecase = new ListProductOrdersUsecaseMock();
        const controller = new ListProductOrderController(usecase as ListProductOrdersUsecase);

        const requestMock: any = {};
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

        await controller.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(200);
        expect(responseMock.data).toEqual([]);
    });
});
