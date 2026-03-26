import ProductOrder from "../entities/ProductOrder";
import { ProductRepository } from "./ProductRepository";
import { SqliteConnection } from "./SqliteConnection";

type ProductOrderRow = {
    uuid: string;
    product_fk: string;
    quantity: number;
    orderDate: string;
    status: string;
};

export interface ProductOrderRepositoryInterface {
    findByUuid(uuid: string): ProductOrder | null;
    listAll(): ProductOrder[];
    save(productOrder: ProductOrder): void;
    updateStatus(productOrder: ProductOrder): void;
    delete(uuid: string): void;
}

export class ProductOrderRepository implements ProductOrderRepositoryInterface {

    constructor(
        private readonly sqliteConnection: SqliteConnection,
        private readonly productRepository: ProductRepository
    ) {}

    public findByUuid(uuid: string): ProductOrder | null {
        const connection = this.sqliteConnection.getConnection();

        const statement = connection.prepare(`
            SELECT uuid, product_fk, quantity, orderDate, status
            FROM productOrder
            WHERE uuid = ?
        `);

        const row = statement.get(uuid) as ProductOrderRow | undefined;

        if (!row) {
            return null;
        }

        const product = this.productRepository.findByBarcode(row.product_fk);
        if (!product) {
            throw new Error(`Related product ${row.product_fk} not found`);
        }

        return ProductOrder.rebuild(
            row.uuid,
            product,
            row.quantity,
            new Date(row.orderDate),
            row.status
        );
    }

    public listAll(): ProductOrder[] {
        const connection = this.sqliteConnection.getConnection();

        const statement = connection.prepare(`
            SELECT po.uuid, po.product_fk, p.name as product_name, po.quantity, po.orderDate, po.status
            FROM productOrder po
            LEFT JOIN products p ON po.product_fk = p.barcode
        `);

        const results = statement.all() as Array<{
            uuid: string;
            product_fk: string;
            product_name: string;
            quantity: number;
            orderDate: string;
            status: string;
        }>;

        return results.map((row) => {
            const product = this.productRepository.findByBarcode(row.product_fk);
            if (!product) {
                throw new Error(`Related product ${row.product_fk} not found`);
            }
            return ProductOrder.rebuild(
                row.uuid,
                product,
                row.quantity,
                new Date(row.orderDate),
                row.status
            );
        });
    }

    public save(productOrder: ProductOrder): void {
        const connection = this.sqliteConnection.getConnection();

        const statement = connection.prepare(`
            INSERT OR REPLACE INTO productOrder (
                uuid,
                product_fk,
                quantity,
                orderDate,
                status
            )
            VALUES (?, ?, ?, ?, ?)
        `);

        statement.run(
            productOrder.getUuid(),
            productOrder.getProduct().getBarcode(),
            productOrder.getQuantity(),
            productOrder.getOrderDate().toISOString(),
            productOrder.getStatus()
        );
    }

    public updateStatus(productOrder: ProductOrder): void {
        const connection = this.sqliteConnection.getConnection();
        const statement = connection.prepare("UPDATE productOrder SET status = ? WHERE uuid = ?");
        statement.run(productOrder.getStatus(), productOrder.getUuid());
    }

    public delete(uuid: string): void {
        const connection = this.sqliteConnection.getConnection();
        const statement = connection.prepare("DELETE FROM productOrder WHERE uuid = ?");
        statement.run(uuid);
    }
}
