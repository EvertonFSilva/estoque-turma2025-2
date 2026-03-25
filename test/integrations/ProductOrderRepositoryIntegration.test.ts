import { describe, expect, test, beforeEach } from '@jest/globals';
import ProductOrder from '../../src/entities/ProductOrder';
import { SqliteConnection } from '../../src/repositories/SqliteConnection';
import { ProductRepository } from '../../src/repositories/ProductRepository';
import { ProductOrderRepository } from '../../src/repositories/ProductOrderRepository';

// teste de integração usando os métodos findByUuid e listAll, incluindo casos de sucesso e falha (quando o produto relacionado não existe)
describe('ProductOrderRepository Integration Test', () => {
    let sqliteConnection: SqliteConnection;
    let productOrderRepository: ProductOrderRepository;

    beforeEach(() => {
        sqliteConnection = new SqliteConnection('db/estoque-testes.db');
        const productRepository = new ProductRepository(sqliteConnection);
        productOrderRepository = new ProductOrderRepository(sqliteConnection, productRepository);
        const db = sqliteConnection.getConnection();
        db.exec('PRAGMA foreign_keys = OFF;');
        db.exec('DELETE FROM productOrder;');
        db.exec('DELETE FROM products;');
        db.exec('PRAGMA foreign_keys = ON;');
    });

    // deve pegar uma ordem de produto por uuid com sucesso
    test('should get product order by uuid successfully', () => {
        const db = sqliteConnection.getConnection();

        db.exec("INSERT INTO products (barcode, name, quantity_in_stock, order_reference_days) VALUES ('333', 'Produto 3', 0, 12);");
        db.exec("INSERT INTO productOrder (uuid, product_fk, quantity, orderDate, status) VALUES ('order-3', '333', 9, '2026-01-12T00:00:00.000Z', 'opened');");

        const result = productOrderRepository.findByUuid('order-3');


        expect(result).toBeInstanceOf(ProductOrder);
        expect(result?.getUuid()).toBe('order-3');
        expect(result?.getProduct().getBarcode()).toBe('333');
        expect(result?.getProduct().getName()).toBe('Produto 3');
        expect(result?.getQuantity()).toBe(9);
        expect(result?.getStatus()).toBe('opened');
    });

    // deve retornar null quando o uuid não existir
    test('should return null when uuid does not exist', () => {
        const result = productOrderRepository.findByUuid('order-not-found');

        expect(result).toBeNull();
    });

    // deve lançar um erro quando o produto relacionado à ordem não existir
    test('should throw ERROR if related product does not exist when getting order by uuid', () => {
        const db = sqliteConnection.getConnection();

        db.exec('PRAGMA foreign_keys = OFF;');
        db.exec("INSERT INTO productOrder (uuid, product_fk, quantity, orderDate, status) VALUES ('order-orphan-get', '888', 4, '2026-01-12T00:00:00.000Z', 'opened');");
        db.exec('PRAGMA foreign_keys = ON;');

        expect(() => productOrderRepository.findByUuid('order-orphan-get')).toThrow('Related product 888 not found');
    });

    // deve listar todas as ordens de produto com sucesso
    test('should list all product orders successfully', () => {
        const db = sqliteConnection.getConnection();

        db.exec("INSERT INTO products (barcode, name, quantity_in_stock, order_reference_days) VALUES ('111', 'Produto 1', 0, 7);");
        db.exec("INSERT INTO products (barcode, name, quantity_in_stock, order_reference_days) VALUES ('222', 'Produto 2', 0, 10);");

        db.exec("INSERT INTO productOrder (uuid, product_fk, quantity, orderDate, status) VALUES ('order-1', '111', 5, '2026-01-10T00:00:00.000Z', 'opened');");
        db.exec("INSERT INTO productOrder (uuid, product_fk, quantity, orderDate, status) VALUES ('order-2', '222', 3, '2026-01-11T00:00:00.000Z', 'closed');");

        const result = productOrderRepository.listAll();

        expect(result).toHaveLength(2);
        expect(result[0]).toBeInstanceOf(ProductOrder);
        expect(result[0].getUuid()).toBe('order-1');
        expect(result[0].getProduct().getBarcode()).toBe('111');
        expect(result[0].getQuantity()).toBe(5);
        expect(result[0].getStatus()).toBe('opened');

        expect(result[1].getUuid()).toBe('order-2');
        expect(result[1].getProduct().getBarcode()).toBe('222');
        expect(result[1].getQuantity()).toBe(3);
        expect(result[1].getStatus()).toBe('closed');
    });

    // deve retornar uma lista vazia quando não houver ordens de produto
    test('should return empty list when there are no product orders', () => {
        const result = productOrderRepository.listAll();

        expect(result).toEqual([]);
    });

    // deve lançar um erro quando o produto relacionado a uma das ordens não existir
    test('should throw ERROR if related product does not exist when listing orders', () => {
        const db = sqliteConnection.getConnection();

        db.exec('PRAGMA foreign_keys = OFF;');
        db.exec("INSERT INTO productOrder (uuid, product_fk, quantity, orderDate, status) VALUES ('order-orphan', '999', 7, '2026-01-12T00:00:00.000Z', 'opened');");
        db.exec('PRAGMA foreign_keys = ON;');

        expect(() => productOrderRepository.listAll()).toThrow('Related product 999 not found');
    });
});
