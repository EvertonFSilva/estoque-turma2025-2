import ProductOutput from "../entities/ProductOutput";
import type { ProductRepository } from "./ProductRepository";
import type { SqliteConnection } from "./SqliteConnection";

type ProductOutputRow = {
    uuid: string;
    product_fk: string;
    quantity: number;
    outputDate: string;
};

export interface ProductOutputRepositoryInterface {
    save(productOutput: ProductOutput): void;
    findByUuid(uuid: string): ProductOutput | null;
}

export class ProductOutputRepository implements ProductOutputRepositoryInterface {

    constructor(
        private readonly sqliteConnection: SqliteConnection,
        private readonly productRepository: ProductRepository
    ) {}

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
            new Date(row.outputDate),
        );
    }
    
}
