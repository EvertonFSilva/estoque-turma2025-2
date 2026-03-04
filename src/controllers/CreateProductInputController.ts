import type { FastifyRequest, FastifyReply } from "fastify";
import Database from "better-sqlite3";


export class CreateProductInputController {
    // Permitir injetar o caminho do banco de teste para facilitar testes
    private dbPath: string;

    constructor(dbPath: string = "db/estoque.db") {
        this.dbPath = dbPath;
    }

    public async handle(request: FastifyRequest, response: FastifyReply): Promise<FastifyReply> {
        const { productOrderId, quantity, inputDate } = request.body as { productOrderId: string; quantity: number; inputDate: string; };

        if (!productOrderId) {
            return response.status(400).send({ error: "Product order ID is required" });
        }

        if (!quantity || quantity <= 0) {
            return response.status(400).send({ error: "Quantity must be a positive number" });
        }

        if (!inputDate) {
            return response.status(400).send({ error: "Input date is required" });
        }

        const newInputDate = new Date(inputDate);
        if (isNaN(newInputDate.getTime())) {
            return response.status(400).send({ error: "Invalid input date format" });
        }
        
        try {
            const connection = new Database(this.dbPath);

            const statement = connection.prepare("SELECT * FROM productOrder WHERE uuid = ?");
            const productOrder = statement.get(productOrderId) as { uuid: string; product_fk: string; quantity: number; orderDate: string, status: string } | undefined;
            if (!productOrder) {
                return response.status(404).send({ error: "Product order not found" });
            }

            if (productOrder.status !== "opened") {
                return response.status(400).send({ error: "Product order is not in opened status" });
            }

            const orderDate = new Date(productOrder.orderDate);

            if (orderDate > newInputDate) {
                return response.status(400).send({ error: "Input date cannot be before the product order date" });
            }

            const getProductStatement = connection.prepare("SELECT * FROM products WHERE barcode = ?");
            const product = getProductStatement.get(productOrder.product_fk) as { barcode: string; name: string; quantity_in_stock: number } | undefined;
            if (!product) {
                return response.status(404).send({ error: "Product not found" });
            }

            const uuid = crypto.randomUUID();

            const insertStatement = connection.prepare("INSERT INTO productInput (uuid, productOrder_fk, quantity, inputDate) VALUES (?, ?, ?, ?)");
            insertStatement.run(uuid, productOrderId, quantity, newInputDate.toISOString());

            const updateProductOrderStatement = connection.prepare("UPDATE productOrder SET status = ? WHERE uuid = ?");
            updateProductOrderStatement.run("closed", productOrderId);

            const newStock = product.quantity_in_stock + quantity;

            const updateProductStatement = connection.prepare("UPDATE products SET quantity_in_stock = ? WHERE barcode = ?");
            updateProductStatement.run(newStock, productOrder.product_fk);

            return response.status(201).send({ 
                productInputId: uuid,
                productInputQuantity: quantity,
                productInputDate: newInputDate.toISOString(),
                productOrderId: productOrderId,
                productOrderDate: productOrder.orderDate,
                productOrderStatus: "closed",
                productBarcode: product.barcode,
                productName: product.name,
                productStock: newStock
             });

        } catch (error) {
            return response.status(500).send({ error: "Internal server error" });
        }
    }
}