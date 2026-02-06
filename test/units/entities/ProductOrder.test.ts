import ProductOrder from '../../../src/entities/ProductOrder';
import Product from '../../../src/entities/Product';

describe('Entidade ProductOrder', () => {
  
    test('Deve instanciar um objeto da classe ProductOrder quando os dados forem válidos', () => {
        const product = Product.rebuild('1234567890123', 'Coca Cola 2L', 14, 7);
        const quantity: number = 10;
        const orderDate: Date = new Date('2025-11-13');

        if (product instanceof Product) {
            const productOrder = ProductOrder.create(product, quantity, orderDate);

            expect(productOrder).toBeInstanceOf(ProductOrder);
            if (productOrder instanceof ProductOrder) {
                expect(productOrder.getUuid()).toBeDefined();
                expect(productOrder.getUuid().length).toBeGreaterThan(0);
                expect(typeof productOrder.getUuid()).toBe('string');
                expect(productOrder.getProduct()).toBe(product);
                expect(productOrder.getQuantity()).toBe(quantity);
                expect(productOrder.getOrderDate()).toEqual(orderDate);
                expect(productOrder.getStatus()).toBe('opened');
            }
        }
    });

    test('Deve retornar um erro quando o produto for inválido', () => {
        const product = null;
        const quantity: number = 10;
        const orderDate: Date = new Date('2025-11-13');

        const productOrder = ProductOrder.create(product as any, quantity, orderDate);

        expect(productOrder).toBeInstanceOf(Error);
    });

    test('Deve retornar um erro quando a quantidade não for positiva', () => {
        const product = Product.rebuild('1234567890123', 'Coca Cola 2L', 14, 7);
        const orderDate: Date = new Date('2025-11-13');

        if (product instanceof Product) {
            let quantity: number = -5;
            const productOrder = ProductOrder.create(product, quantity, orderDate);
            expect(productOrder).toBeInstanceOf(Error);

            quantity = 0;
            const productOrderZero = ProductOrder.create(product, quantity, orderDate);
            expect(productOrderZero).toBeInstanceOf(Error);
        }
    });

    test('Deve retornar um erro quando a data do pedido for inválida', () => {
        const product = Product.rebuild('1234567890123', 'Coca Cola 2L', 14, 7);
        const quantity: number = 10;
        const orderDate: Date = new Date('invalid');

        if (product instanceof Product) {
            const productOrder = ProductOrder.create(product, quantity, orderDate);
            expect(productOrder).toBeInstanceOf(Error);
        }
    });
    
    test('Deve reconstruir um objeto da classe ProductOrder', () => {
        const uuid: string = 'uuid-789-012';
        const product = Product.rebuild('9876543210987', 'Guaraná Antarctica 2L', 30, 14);
        const quantity: number = 20;
        const orderDate: Date = new Date('2025-11-14');
        const status: string = 'opened';

        const productOrder = ProductOrder.rebuild(uuid, product, quantity, orderDate, status);

        expect(productOrder).toBeInstanceOf(ProductOrder);
        expect(productOrder.getUuid()).toBe(uuid);
        expect(productOrder.getProduct()).toBe(product);
        expect(productOrder.getQuantity()).toBe(quantity);
        expect(productOrder.getOrderDate()).toEqual(orderDate);
        expect(productOrder.getStatus()).toBe(status);
    });
});