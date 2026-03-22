import { describe, expect, test } from '@jest/globals';
import ProductOrder from '../../src/entities/ProductOrder';
import { SqliteConnection } from '../../src/repositories/SqliteConnection';
import { ProductRepository } from '../../src/repositories/ProductRepository';
import { ProductOrderRepository } from '../../src/repositories/ProductOrderRepository';

describe('ProductOrderRepository Integration Test', () => {
    test('should list all product orders successfully', () => {
        const sqliteConnection = new SqliteConnection('db/estoque-testes.db');
        const productRepository = new ProductRepository(sqliteConnection);
        const productOrderRepository = new ProductOrderRepository(sqliteConnection, productRepository);

        const db = sqliteConnection.getConnection();
        db.exec('PRAGMA foreign_keys = OFF;');
        db.exec('DELETE FROM productOrder;');
        db.exec('DELETE FROM products;');
        db.exec('PRAGMA foreign_keys = ON;');

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

    test('should throw ERROR if related product does not exist when listing orders', () => {
        const sqliteConnection = new SqliteConnection('db/estoque-testes.db');
        const productRepository = new ProductRepository(sqliteConnection);
        const productOrderRepository = new ProductOrderRepository(sqliteConnection, productRepository);

        const db = sqliteConnection.getConnection();
        db.exec('PRAGMA foreign_keys = OFF;');
        db.exec('DELETE FROM productOrder;');
        db.exec('DELETE FROM products;');

        db.exec("INSERT INTO productOrder (uuid, product_fk, quantity, orderDate, status) VALUES ('order-orphan', '999', 7, '2026-01-12T00:00:00.000Z', 'opened');");
        db.exec('PRAGMA foreign_keys = ON;');

        expect(() => productOrderRepository.listAll()).toThrow('Related product 999 not found');
    });
});
