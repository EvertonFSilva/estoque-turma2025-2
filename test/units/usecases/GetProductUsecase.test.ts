import Product from '../../../src/entities/Product';
import { ProductRepositoryInterface } from '../../../src/repositories/ProductRepository';
import { GetProductUsecase } from '../../../src/usecases/GetProductUsecase';

describe('GetProductUsecase', () => {
    test('should get a product successfully', async () => {
  
        class ProductRepositoryMock implements ProductRepositoryInterface {
            findByBarcode(barcode: string): Product | null {
                return Product.rebuild('1234567890123', 'Test Product', 10, 14);
            }
            createProduct(product: Product): boolean {
                return true;
            }
        }

        const productRepositoryMock = new ProductRepositoryMock();
        const getProductUsecase = new GetProductUsecase(productRepositoryMock);

        const barcode: string = '1234567890123';

        const result = getProductUsecase.execute(barcode);

        expect(result).toBeInstanceOf(Product);
        if (result instanceof Product) {
            expect(result.getBarcode()).toBe(barcode);
            expect(result.getName()).toBe('Test Product');
            expect(result.getQuantityInStock()).toBe(10);
            expect(result.getOrderReferenceDays()).toBe(14);
        }
    });

    test('should return ERROR if product not found', async () => {
  
        class ProductRepositoryMock implements ProductRepositoryInterface {
            findByBarcode(barcode: string): Product | null {
                return null;
            }
            createProduct(product: Product): boolean {
                return true;
            }
        }

        const productRepositoryMock = new ProductRepositoryMock();
        const getProductUsecase = new GetProductUsecase(productRepositoryMock);

        const barcode: string = '1234567890123';

        const result = getProductUsecase.execute(barcode);

        expect(result).toBeInstanceOf(Error);
        if (result instanceof Error) {
            expect(result.message).toBe('Product not found');
        }
    });  
    
    test('should return ERROR if repository throws an error', async () => {
  
        class ProductRepositoryMock implements ProductRepositoryInterface {
            findByBarcode(barcode: string): Product | null {
                throw new Error('Database connection lost');
            }
            createProduct(product: Product): boolean {
                return true;
            }
        }

        const productRepositoryMock = new ProductRepositoryMock();
        const getProductUsecase = new GetProductUsecase(productRepositoryMock);

        const barcode: string = '1234567890123';

        const result = getProductUsecase.execute(barcode);

        expect(result).toBeInstanceOf(Error);
        if (result instanceof Error) {
            expect(result.message).toBe('Error retrieving product');
        }
    });         
});
