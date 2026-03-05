import Product from "../entities/Product";
import { SqliteConnection } from "./SqliteConnection";

export interface ProductRepositoryInterface {
    findByBarcode(barcode: string): Product | null;
    createProduct(product: Product): boolean;
    updateStock(barcode: string, newStock: number): void;
}

export class ProductRepository implements ProductRepositoryInterface {
    private sqliteConnection: SqliteConnection;

    constructor(sqliteConnection: SqliteConnection) {
        this.sqliteConnection = sqliteConnection;
    }

    public findByBarcode(barcode: string): Product | null {
        const connection = this.sqliteConnection.getConnection();
        const statement = connection.prepare("SELECT * FROM products WHERE barcode = ?");
        const result = statement.get(barcode) as { barcode: string; name: string; quantity_in_stock: number; order_reference_days: number } | undefined;
        if (result) {
            const product = Product.rebuild(result.barcode, result.name, result.quantity_in_stock, result.order_reference_days);
            return product;
        } else {
            return null;
        }
    }

    public createProduct(product: Product): boolean {
        let resultado: boolean = false;

        const connection = this.sqliteConnection.getConnection();
        const statement = connection.prepare(`
            INSERT INTO products (barcode, name, quantity_in_stock, order_reference_days)
            VALUES (?, ?, ?, ?)
        `);
        const result = statement.run(product.getBarcode(),
            product.getName(),
            product.getQuantityInStock(),
            product.getOrderReferenceDays()
        );

        if (result.changes > 0) {
            resultado = true;
        }
        return resultado;
    }

    public updateStock(barcode: string, newStock: number): void {
        const connection = this.sqliteConnection.getConnection();
        const statement = connection.prepare("UPDATE products SET quantity_in_stock = ? WHERE barcode = ?");
        statement.run(newStock, barcode);
    }
}