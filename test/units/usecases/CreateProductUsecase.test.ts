import Product from '../../../src/entities/Product';
import { ProductRepositoryInterface } from '../../../src/repositories/ProductRepository';
import { CreateProductUsecase } from '../../../src/usecases/CreateProductUsecase';

describe('CreateProductUsecase', () => {
    test('should create a product successfully', async () => {
  
        class ProductRepositoryMock implements ProductRepositoryInterface {
            findByBarcode(barcode: string): Product | null {
                return null;
            }
            createProduct(product: Product): boolean {
                return true;
            }
        }

        const productRepositoryMock = new ProductRepositoryMock();
        const createProductUsecase = new CreateProductUsecase(productRepositoryMock);

        const barcode: string = '1234567890123';
        const name: string = 'Test Product';
        const orderReferenceDays: number = 14;

        const result = createProductUsecase.execute(barcode, name, orderReferenceDays);

        expect(result).toBeInstanceOf(Product);
        if (result instanceof Product) {
            expect(result.getBarcode()).toBe(barcode);
            expect(result.getName()).toBe(name);
            expect(result.getOrderReferenceDays()).toBe(orderReferenceDays);
            expect(result.getQuantityInStock()).toBe(0);
        }
    });

    test('should return ERROR if barcode exist', async () => {
  
        class ProductRepositoryMock implements ProductRepositoryInterface {
            findByBarcode(barcode: string): Product | null {
                return Product.rebuild(barcode, 'lalala', 10, 5);
            }
            createProduct(product: Product): boolean {
                return true;
            }
        }

        const productRepositoryMock = new ProductRepositoryMock();
        const createProductUsecase = new CreateProductUsecase(productRepositoryMock);

        const barcode: string = '1234567890123';
        const name: string = 'Test Product';
        const orderReferenceDays: number = 14;

        const result = createProductUsecase.execute(barcode, name, orderReferenceDays);

        expect(result).toBeInstanceOf(Error);
        if (result instanceof Error) {
            expect(result.message).toBe('Product with this barcode already exists');
        }
    });  
    
    test('should return ERROR if it violates a business rule of the Product class', async () => {
  
        class ProductRepositoryMock implements ProductRepositoryInterface {
            findByBarcode(barcode: string): Product | null {
                return null;
            }
            createProduct(product: Product): boolean {
                return true;
            }
        }

        const productRepositoryMock = new ProductRepositoryMock();
        const createProductUsecase = new CreateProductUsecase(productRepositoryMock);

        const barcode: string = '1234567890123';
        const name: string = '';
        const orderReferenceDays: number = 14;

        const result = createProductUsecase.execute(barcode, name, orderReferenceDays);

        expect(result).toBeInstanceOf(Error);
    }); 
    
    test('should return ERROR if it fails to save to the database', async () => {
  
        class ProductRepositoryMock implements ProductRepositoryInterface {
            findByBarcode(barcode: string): Product | null {
                return null;
            }
            createProduct(product: Product): boolean {
                return false;
            }
        }

        const productRepositoryMock = new ProductRepositoryMock();
        const createProductUsecase = new CreateProductUsecase(productRepositoryMock);

        const barcode: string = '1234567890123';
        const name: string = 'Fanta Uva';
        const orderReferenceDays: number = 14;

        const result = createProductUsecase.execute(barcode, name, orderReferenceDays);

        expect(result).toBeInstanceOf(Error);
    });        

    test('should return ERROR if it fails to save to the database', async () => {
  
        class ProductRepositoryMock implements ProductRepositoryInterface {
            findByBarcode(barcode: string): Product | null {
                throw new Error('Database connection lost');
            }
            createProduct(product: Product): boolean {
                return false;
            }
        }

        const productRepositoryMock = new ProductRepositoryMock();
        const createProductUsecase = new CreateProductUsecase(productRepositoryMock);

        const barcode: string = '1234567890123';
        const name: string = 'Fanta Uva';
        const orderReferenceDays: number = 14;

        const result = createProductUsecase.execute(barcode, name, orderReferenceDays);

        expect(result).toBeInstanceOf(Error);
    });            
});