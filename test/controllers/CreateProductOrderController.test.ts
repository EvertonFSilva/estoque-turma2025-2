import ProductOrder from '../../src/entities/ProductOrder';
import Product from '../../src/entities/Product';
import { CreateProductOrderController } from '../../src/controllers/CreateProductOrderController';
import type { CreateProductOrderUsecase } from '../../src/usecases/CreateProductOrderUsecase';

describe('CreateProductOrderController', () => {
    test('should return 201 if the product order is created successfully', async () => {

        class CreateProductOrderUsecaseMock implements Pick<CreateProductOrderUsecase, 'execute'> {
            execute(barcode: string, quantity: number, orderDate: Date): ProductOrder | Error {
                const product = Product.rebuild(barcode, 'Test Product', 50, 10);
                return ProductOrder.rebuild('test-uuid-123', product, quantity, orderDate);
            }
        }

        const createProductOrderUsecase = new CreateProductOrderUsecaseMock();
        const createProductOrderController = new CreateProductOrderController(createProductOrderUsecase as CreateProductOrderUsecase);

        const orderDate = new Date('2026-01-29');

        const requestMock: any = {
            body: {
                barcode: '123456',
                quantity: 20,
                orderDate: orderDate
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

        await createProductOrderController.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(201);
        expect(responseMock.data).toEqual({
            product: expect.any(Product),
            quantity: 20,
            orderDate: orderDate
        });
    });

    test('should return 400 if the usecase returns an ERROR', async () => {

        class CreateProductOrderUsecaseMock implements Pick<CreateProductOrderUsecase, 'execute'> {
            execute(barcode: string, quantity: number, orderDate: Date): ProductOrder | Error {
                return new Error('Product not found');
            }
        }

        const createProductOrderUsecase = new CreateProductOrderUsecaseMock();
        const createProductOrderController = new CreateProductOrderController(createProductOrderUsecase as CreateProductOrderUsecase);

        const orderDate = new Date('2026-01-29');

        const requestMock: any = {
            body: {
                barcode: '999999',
                quantity: 20,
                orderDate: orderDate
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

        await createProductOrderController.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(400);
        expect(responseMock.data).toEqual({
            message: 'Product not found'
        });
    });    
});
