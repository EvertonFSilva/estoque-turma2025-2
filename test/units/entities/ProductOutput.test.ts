import Product from '../../../src/entities/Product';
import ProductOutput from '../../../src/entities/ProductOutput';

describe('Entidade ProductOutput', () => {
    test('Deve instanciar um objeto da classe ProductOutput quando os dados forem válidos', () => {
        const product = Product.create('1234567890123', 'Coca Cola 2L', 14);
        const quantity = 5;
        const outputDate = new Date('2024-01-01');
        const productOutput = ProductOutput.create(product as Product, quantity, outputDate);
        expect(productOutput).toBeInstanceOf(ProductOutput);
        if (productOutput instanceof ProductOutput) {
            expect(productOutput.getProduct()).toBe(product);
            expect(productOutput.getQuantity()).toBe(quantity);
            expect(productOutput.getOutputDate()).toEqual(outputDate);
            expect(typeof productOutput.getUuid()).toBe('string');
        }
    });

    test('Deve retornar erro se o produto for nulo', () => {
        const quantity = 5;
        const outputDate = new Date('2024-01-01');
        const productOutput = ProductOutput.create(null as any, quantity, outputDate);
        expect(productOutput).toBeInstanceOf(Error);
        if (productOutput instanceof Error) {
            expect(productOutput.message).toBe('Product cannot be null or invalid');
        }
    });

    test('Deve retornar erro se o produto não for instância de Product', () => {
        const quantity = 5;
        const outputDate = new Date('2024-01-01');
        const productOutput = ProductOutput.create({} as any, quantity, outputDate);
        expect(productOutput).toBeInstanceOf(Error);
        if (productOutput instanceof Error) {
            expect(productOutput.message).toBe('Product cannot be null or invalid');
        }
    });

    test('Deve retornar erro se a quantidade for menor ou igual a zero', () => {
        const product = Product.create('1234567890123', 'Coca Cola 2L', 14) as Product;
        const outputDate = new Date('2024-01-01');
        const productOutputZero = ProductOutput.create(product, 0, outputDate);
        expect(productOutputZero).toBeInstanceOf(Error);
        if (productOutputZero instanceof Error) {
            expect(productOutputZero.message).toBe('Quantity must be positive');
        }
        const productOutputNegative = ProductOutput.create(product, -1, outputDate);
        expect(productOutputNegative).toBeInstanceOf(Error);
        if (productOutputNegative instanceof Error) {
            expect(productOutputNegative.message).toBe('Quantity must be positive');
        }
    });

    test('Deve retornar erro se a data de saída for nula', () => {
        const product = Product.create('1234567890123', 'Coca Cola 2L', 14) as Product;
        const quantity = 5;
        const productOutput = ProductOutput.create(product, quantity, null as any);
        expect(productOutput).toBeInstanceOf(Error);
        if (productOutput instanceof Error) {
            expect(productOutput.message).toBe('Output date is required');
        }
    });

    test('Deve retornar erro se a data de saída for inválida', () => {
        const product = Product.create('1234567890123', 'Coca Cola 2L', 14) as Product;
        const quantity = 5;
        const invalidDate = new Date('invalid-date');
        const productOutput = ProductOutput.create(product, quantity, invalidDate);
        expect(productOutput).toBeInstanceOf(Error);
        if (productOutput instanceof Error) {
            expect(productOutput.message).toBe('Output date must be valid');
        }
    });

    test('Deve reconstruir um objeto da classe ProductOutput', () => {
        const product = Product.create('1234567890123', 'Coca Cola 2L', 14) as Product;
        const quantity = 5;
        const outputDate = new Date('2024-01-01');
        const uuid = 'uuid-mock-123';
        const productOutput = ProductOutput.rebuild(uuid, product, quantity, outputDate);
        expect(productOutput).toBeInstanceOf(ProductOutput);
        expect(productOutput.getUuid()).toBe(uuid);
        expect(productOutput.getProduct()).toBe(product);
        expect(productOutput.getQuantity()).toBe(quantity);
        expect(productOutput.getOutputDate()).toEqual(outputDate);
    });
});
