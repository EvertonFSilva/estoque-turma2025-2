import Product from '../../../src/entities/Product';
import ProductOutput from '../../../src/entities/ProductOutput';
import { CreateProductOutputUsecase } from '../../../src/usecases/CreateProductOutputUsecase';
import { ProductRepositoryInterface } from '../../../src/repositories/ProductRepository';
import { ProductOutputRepositoryInterface } from '../../../src/repositories/ProductOutputRepository';

describe('CreateProductOutputUsecase', () => {
    test('should create a product output successfully', () => {
        class ProductRepositoryMock implements ProductRepositoryInterface {
            findByBarcode(barcode: string) {
                return Product.rebuild(barcode, 'Test Product', 10, 20);
            }
            updateStock(barcode: string, newStock: number) {
                return true;
            }
        }
        class ProductOutputRepositoryMock implements ProductOutputRepositoryInterface {
            save(productOutput: ProductOutput) {
                return true;
            }
        }
        const productRepositoryMock = new ProductRepositoryMock();
        const productOutputRepositoryMock = new ProductOutputRepositoryMock();
        const usecase = new CreateProductOutputUsecase(productOutputRepositoryMock, productRepositoryMock);
        const barcode = '1234567890123';
        const quantity = 5;
        const outputDate = new Date();
        const result = usecase.execute(barcode, quantity, outputDate);
        expect(result).toBeInstanceOf(ProductOutput);
        if (result instanceof ProductOutput) {
            expect(result.getProduct().getBarcode()).toBe(barcode);
            expect(result.getQuantity()).toBe(quantity);
            expect(result.getOutputDate()).toEqual(outputDate);
        }
    });

    test('should return ERROR if product not found', () => {
        class ProductRepositoryMock implements ProductRepositoryInterface {
            findByBarcode(barcode: string) {
                return null;
            }
            updateStock(barcode: string, newStock: number) {
                return true;
            }
        }
        class ProductOutputRepositoryMock implements ProductOutputRepositoryInterface {
            save(productOutput: ProductOutput) {
                return true;
            }
        }
        const productRepositoryMock = new ProductRepositoryMock();
        const productOutputRepositoryMock = new ProductOutputRepositoryMock();
        const usecase = new CreateProductOutputUsecase(productOutputRepositoryMock, productRepositoryMock);
        const result = usecase.execute('notfound', 5, new Date());
        expect(result).toBeInstanceOf(Error);
        if (result instanceof Error) {
            expect(result.message).toBe('Product not found');
        }
    });

    test('should return ERROR if insufficient stock', () => {
        class ProductRepositoryMock implements ProductRepositoryInterface {
            findByBarcode(barcode: string) {
                return Product.rebuild(barcode, 'Test Product', 10, 2);
            }
            updateStock(barcode: string, newStock: number) {
                return true;
            }
        }
        class ProductOutputRepositoryMock implements ProductOutputRepositoryInterface {
            save(productOutput: ProductOutput) {
                return true;
            }
        }
        const productRepositoryMock = new ProductRepositoryMock();
        const productOutputRepositoryMock = new ProductOutputRepositoryMock();
        const usecase = new CreateProductOutputUsecase(productOutputRepositoryMock, productRepositoryMock);
        const result = usecase.execute('1234567890123', 15, new Date());
        expect(result).toBeInstanceOf(Error);
        if (result instanceof Error) {
            expect(result.message).toBe('Insufficient stock for the requested output quantity');
        }
    });

    test('should return ERROR if ProductOutput.create returns Error', () => {
        class ProductRepositoryMock implements ProductRepositoryInterface {
            findByBarcode(barcode: string) {
                return Product.rebuild(barcode, 'Test Product', 10, 20);
            }
            updateStock(barcode: string, newStock: number) {
                return true;
            }
        }
        class ProductOutputRepositoryMock implements ProductOutputRepositoryInterface {
            save(productOutput: ProductOutput) {
                return true;
            }
        }
        // Mock ProductOutput.create to return Error
        const originalCreate = ProductOutput.create;
        ProductOutput.create = () => new Error('Invalid output');
        const productRepositoryMock = new ProductRepositoryMock();
        const productOutputRepositoryMock = new ProductOutputRepositoryMock();
        const usecase = new CreateProductOutputUsecase(productOutputRepositoryMock, productRepositoryMock);
        const result = usecase.execute('1234567890123', 5, new Date());
        expect(result).toBeInstanceOf(Error);
        if (result instanceof Error) {
            expect(result.message).toBe('Invalid output');
        }
        ProductOutput.create = originalCreate; // restore
    });

    test('should return ERROR if repository throws', () => {
        class ProductRepositoryMock implements ProductRepositoryInterface {
            findByBarcode(barcode: string) {
                throw new Error('DB error');
            }
            updateStock(barcode: string, newStock: number) {
                return true;
            }
        }
        class ProductOutputRepositoryMock implements ProductOutputRepositoryInterface {
            save(productOutput: ProductOutput) {
                return true;
            }
        }
        const productRepositoryMock = new ProductRepositoryMock();
        const productOutputRepositoryMock = new ProductOutputRepositoryMock();
        const usecase = new CreateProductOutputUsecase(productOutputRepositoryMock, productRepositoryMock);
        const result = usecase.execute('1234567890123', 5, new Date());
        expect(result).toBeInstanceOf(Error);
        if (result instanceof Error) {
            expect(result.message).toBe('Error creating product output');
        }
    });
});
