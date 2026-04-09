import ProductOutput from "../entities/ProductOutput";
import { ProductRepository } from "./ProductRepository";
import { SqliteConnection } from "./SqliteConnection";

type ProductOutputRow = {
    uuid: string;
    product_fk: string;
    quantity: number;
    outputDate: string;
};

export interface ProductOutputRepositoryInterface {
    findByUuid(uuid: string): ProductOutput | null;
    save(productOutput: ProductOutput): void;
    delete(uuid: string): void;
    listAll(): ProductOutput[];
}

export class ProductOutputRepository implements ProductOutputRepositoryInterface {

    constructor(
        private readonly sqliteConnection: SqliteConnection,
        private readonly productRepository: ProductRepository
    ) {}

    public findByUuid(uuid: string): ProductOutput | null {
        const connection = this.sqliteConnection.getConnection();

        const statement = connection.prepare(`
            SELECT uuid, product_fk, quantity, outputDate
            FROM productOutput
            WHERE uuid = ?
        `);

        const row = statement.get(uuid) as ProductOutputRow | undefined;

        if (!row) {
            return null;
        }

        const product = this.productRepository.findByBarcode(row.product_fk);

        if (!product) {
            throw new Error(`Related product ${row.product_fk} not found`);
        }

        return ProductOutput.rebuild(
            row.uuid,
            product,
            row.quantity,
            new Date(row.outputDate)
        );
    }

    public listAll(): ProductOutput[] {
        const connection = this.sqliteConnection.getConnection();

        const statement = connection.prepare(`
            SELECT po.uuid, po.product_fk, p.name as product_name, po.quantity, po.outputDate
            FROM productOutput po
            LEFT JOIN products p ON po.product_fk = p.barcode
        `);

        const results = statement.all() as Array<{
            uuid: string;
            product_fk: string;
            product_name: string;
            quantity: number;
            outputDate: string;
        }>;

        return results.map((row) => {
            const product = this.productRepository.findByBarcode(row.product_fk);
            if (!product) {
                throw new Error(`Related product ${row.product_fk} not found`);
            }
            return ProductOutput.rebuild(
                row.uuid,
                product,
                row.quantity,
                new Date(row.outputDate)
            );
        });
    }

    public save(productOutput: ProductOutput): void {
        const connection = this.sqliteConnection.getConnection();

        const statement = connection.prepare(`
            INSERT OR REPLACE INTO productOutput (
                uuid,
                product_fk,
                quantity,
                outputDate
            )
            VALUES (?, ?, ?, ?)
        `);

        statement.run(
            productOutput.getUuid(),
            productOutput.getProduct().getBarcode(),
            productOutput.getQuantity(),
            productOutput.getOutputDate().toISOString()
        );
    }

    public delete(uuid: string): void {
        const connection = this.sqliteConnection.getConnection();

        const statement = connection.prepare(`
            DELETE FROM productOutput
            WHERE uuid = ?
        `);

        statement.run(uuid);
    }
}