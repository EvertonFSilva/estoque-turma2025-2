import { describe, expect, test } from '@jest/globals';
import Product from '../../../src/entities/Product';
import ProductOutput from '../../../src/entities/ProductOutput';
import { ListProductOutputController } from '../../../src/controllers/ListProductOutputController';
import type { ListProductOutputUsecaseInterface } from '../../../src/usecases/ListProductOutputUsecase';

describe('ListProductOutputController', () => {
    test('should return 200 with the list of product outputs', async () => {

        class ListProductOutputsUsecaseMock implements ListProductOutputUsecaseInterface {
            execute(): ProductOutput[] | Error {
                const product = Product.rebuild('123456', 'Produto Teste', 10, 7);
                return [
                    ProductOutput.rebuild('output-1', product, 5, new Date('2026-01-10')),
                    ProductOutput.rebuild('output-2', product, 3, new Date('2026-01-11'))
                ];
            }
        }

        const usecase = new ListProductOutputsUsecaseMock();
        const controller = new ListProductOutputController(usecase as ListProductOutputUsecaseInterface);

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
                uuid: 'output-1',
                product: 'Produto Teste',
                quantity: 5,
                outputDate: new Date('2026-01-10')
            },
            {
                uuid: 'output-2',
                product: 'Produto Teste',
                quantity: 3,
                outputDate: new Date('2026-01-11'),
            }
        ]);
    });

    test('should return 400 if usecase returns an ERROR', async () => {

        class ListProductOutputsUsecaseMock implements ListProductOutputUsecaseInterface {
            execute(): ProductOutput[] | Error {
                return new Error('Error listing product outputs');
            }
        }

        const usecase = new ListProductOutputsUsecaseMock();
        const controller = new ListProductOutputController(usecase as ListProductOutputUsecaseInterface);

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
        expect(responseMock.data).toEqual({ message: 'Error listing product outputs' });
    });

    test('should return 200 with empty array when usecase returns empty array', async () => {
        class ListProductOutputsUsecaseMock implements ListProductOutputUsecaseInterface {
            execute(): ProductOutput[] | Error {
                return [];
            }
        }
        const usecase = new ListProductOutputsUsecaseMock();
        const controller = new ListProductOutputController(usecase as ListProductOutputUsecaseInterface);
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

    test('should return 200 with empty array when usecase returns non-array non-error value', async () => {
        class ListProductOutputsUsecaseMock implements ListProductOutputUsecaseInterface {
            execute(): ProductOutput[] | Error | any {
                return null; // não é array nem Error
            }
        }
        const usecase = new ListProductOutputsUsecaseMock();
        const controller = new ListProductOutputController(usecase as ListProductOutputUsecaseInterface);
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
