import { describe, expect, test } from '@jest/globals';
import Product from '../../../src/entities/Product';
import ProductOrder from '../../../src/entities/ProductOrder';
import type { ProductOrderRepositoryInterface } from '../../../src/repositories/ProductOrderRepository';
import { ListProductOrdersUsecase } from '../../../src/usecases/ListProductOrdersUsecase';

describe('ListProductOrdersUsecase', () => {
    test('should return a list of ProductOrder when listAll returns data', () => {
        class ProductOrderRepositoryMock implements ProductOrderRepositoryInterface {
            findByUuid(_uuid: string): ProductOrder | null {
                return null;
            }

            listAll(): ProductOrder[] {
                const product = Product.rebuild('111', 'P1', 10, 7);
                return [
                    ProductOrder.rebuild('order-1', product, 5, new Date('2026-01-10'), 'opened'),
                    ProductOrder.rebuild('order-2', product, 3, new Date('2026-01-11'), 'closed')
                ];
            }

            save(_productOrder: ProductOrder): void {
            }

            updateStatus(_productOrder: ProductOrder): void {
            }
        }

        const repository = new ProductOrderRepositoryMock();
        const usecase = new ListProductOrdersUsecase(repository);

        const result = usecase.execute();

        expect(Array.isArray(result)).toBe(true);
        if (Array.isArray(result)) {
            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(ProductOrder);
            expect(result[0].getUuid()).toBe('order-1');
            expect(result[1].getUuid()).toBe('order-2');
        }
    });

    test('should return ERROR when repository throws exception', () => {
        class ProductOrderRepositoryMock implements ProductOrderRepositoryInterface {
            findByUuid(_uuid: string): ProductOrder | null {
                return null;
            }

            listAll(): ProductOrder[] {
                throw new Error('DB error');
            }

            save(_productOrder: ProductOrder): void {
            }

            updateStatus(_productOrder: ProductOrder): void {
            }
        }

        const repository = new ProductOrderRepositoryMock();
        const usecase = new ListProductOrdersUsecase(repository);

        const result = usecase.execute();

        expect(result).toBeInstanceOf(Error);
        if (result instanceof Error) {
            expect(result.message).toBe('Error listing product orders');
        }
    });

    test('should return empty array when listAll returns empty data', () => {
        class ProductOrderRepositoryMock implements ProductOrderRepositoryInterface {
            findByUuid(_uuid: string): ProductOrder | null {
                return null;
            }

            listAll(): ProductOrder[] {
                return [];
            }

            save(_productOrder: ProductOrder): void {
            }

            updateStatus(_productOrder: ProductOrder): void {
            }
        }

        const repository = new ProductOrderRepositoryMock();
        const usecase = new ListProductOrdersUsecase(repository);

        const result = usecase.execute();

        expect(Array.isArray(result)).toBe(true);
        if (Array.isArray(result)) {
            expect(result).toHaveLength(0);
            expect(result).toEqual([]);
        }
    });
});
