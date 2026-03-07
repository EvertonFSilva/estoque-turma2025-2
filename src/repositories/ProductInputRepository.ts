import ProductInput from "../entities/ProductInput";
import { SqliteConnection } from "./SqliteConnection";

export interface ProductInputRepositoryInterface {
    save(productInput: ProductInput): void;
    findByUuid(uuid: string): ProductInput | null;
    delete(uuid: string): void;
}

export class ProductInputRepository implements ProductInputRepositoryInterface {
    private sqliteConnection: SqliteConnection;

    constructor(sqliteConnection: SqliteConnection) {
        this.sqliteConnection = sqliteConnection;
    }

    public save(productInput: ProductInput): void {
        const connection = this.sqliteConnection.getConnection();
        const statement = connection.prepare("INSERT INTO productInput (uuid, productOrder_fk, quantity, inputDate) VALUES (?, ?, ?, ?)");
        statement.run(
            productInput.getUuid(),
            productInput.getProductOrderId(),
            productInput.getQuantity(),
            productInput.getInputDate().toISOString()
        );
    }

    public findByUuid(uuid: string): ProductInput | null {
        const connection = this.sqliteConnection.getConnection();
        const statement = connection.prepare("SELECT * FROM productInput WHERE uuid = ?");
        const row = statement.get(uuid) as { uuid: string; productOrder_fk: string; quantity: number; inputDate: string } | undefined;
        if (!row) {
            return null;
        }
        return ProductInput.rebuild(row.uuid, row.productOrder_fk, row.quantity, new Date(row.inputDate));
    }

    public delete(uuid: string): void {
        const connection = this.sqliteConnection.getConnection();
        const statement = connection.prepare("DELETE FROM productInput WHERE uuid = ?");
        statement.run(uuid);
    }
}
