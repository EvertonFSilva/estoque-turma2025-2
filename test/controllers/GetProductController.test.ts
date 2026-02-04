import Product from '../../src/entities/Product';
import { GetProductController } from '../../src/controllers/GetProductController';
import type { GetProductUsecase } from '../../src/usecases/GetProductUsecase';

describe('GetProductController', () => {
    test('should return 200 if the product is found successfully', async () => {

        class GetProductUsecaseMock implements Pick<GetProductUsecase, 'execute'> {
            execute(barcode: string): Product | Error {
                return Product.rebuild(barcode, 'Test Product', 50, 10);
            }
        }

        const getProductUsecase = new GetProductUsecaseMock();
        const getProductController = new GetProductController(getProductUsecase as GetProductUsecase);

        const requestMock: any = {
            body: {
                barcode: '123456'
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

        await getProductController.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(200);
        expect(responseMock.data).toEqual({
            barcode: '123456',
            name: 'Test Product',
            quantityInStock: 50,
            orderReferenceDays: 10
        });
    });

    test('should return 400 if the usecase returns an ERROR', async () => {

        class GetProductUsecaseMock implements Pick<GetProductUsecase, 'execute'> {
            execute(barcode: string): Product | Error {
                return new Error('Product not found');
            }
        }

        const getProductUsecase = new GetProductUsecaseMock();
        const getProductController = new GetProductController(getProductUsecase as GetProductUsecase);

        const requestMock: any = {
            body: {
                barcode: '999999'
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

        await getProductController.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(400);
        expect(responseMock.data).toEqual({
            message: 'Product not found'
        });
    });    
});