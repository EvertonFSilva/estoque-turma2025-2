import Product from '../../../src/entities/Product';

describe('Entidade Product', () => {
  
    test('Deve instanciar um objeto da classe Product quando os dados forem válidos', () => {
        const barcode: string = '1234567890123';
        const name: string = "Coca Cola 2L";
        const orderReferenceDays: number = 14;

        const product = Product.create(barcode, name, orderReferenceDays);

        expect(product).toBeInstanceOf(Product);
        if (product instanceof Product) {
            expect(product.getBarcode()).toBe(barcode);
            expect(product.getName()).toBe(name);
            expect(product.getQuantityInStock()).toBe(0);
            expect(product.getOrderReferenceDays()).toBe(orderReferenceDays);
        }
    });

    test('Deve retorna um erro quando o código de barras for inválido', () => {
        const barcode: string = "";
        const name: string = "Coca Cola 2L";
        const orderReferenceDays: number = 14;

        const product = Product.create(barcode, name, orderReferenceDays);

        expect(product).toBeInstanceOf(Error);
    });

    test('Deve retorna um erro quando o nome for inválido', () => {
        const barcode: string = "2412412412";
        const name: string = "";
        const orderReferenceDays: number = 14;

        const product = Product.create(barcode, name, orderReferenceDays);

        expect(product).toBeInstanceOf(Error);
    });    

    test('Deve retorna um erro quando o orderReferenceDays não for positivo', () => {
        const barcode: string = "2412412412";
        const name: string = "Coca Cola 2L";

        let orderReferenceDays: number = -2;
        const product = Product.create(barcode, name, orderReferenceDays);
        expect(product).toBeInstanceOf(Error);

        orderReferenceDays = 0;
        const productZero = Product.create(barcode, name, orderReferenceDays);
        expect(productZero).toBeInstanceOf(Error);
    });    
    
    test('Deve reconstruir um objeto da classe Product', () => {
        const barcode: string = '1234567890123';
        const name: string = "Coca Cola 2L";
        const quantityInStock: number = 50;
        const orderReferenceDays: number = 14;

        const product = Product.rebuild(barcode, name, quantityInStock, orderReferenceDays);

        expect(product).toBeInstanceOf(Product);
        expect(product.getBarcode()).toBe(barcode);
        expect(product.getName()).toBe(name);
        expect(product.getQuantityInStock()).toBe(quantityInStock);
        expect(product.getOrderReferenceDays()).toBe(orderReferenceDays);
    });
});