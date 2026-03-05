import ProductInput from "../entities/ProductInput";
import { SqliteConnection } from "./SqliteConnection";

export interface ProductInputRepositoryInterface {
    save(productInput: ProductInput): void;
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
}
