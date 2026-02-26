import type { FastifyRequest, FastifyReply } from "fastify";
import Database from "better-sqlite3";


export class CreateProductOutputController {
    public async handle(request: FastifyRequest, response: FastifyReply): Promise<FastifyReply> {
        const { barcode, quantity, outputDate } = request.body as { barcode: string; quantity: number; outputDate: string; };

        if (!barcode) {
            return response.status(400).send({ error: "Barcode is required" });
        }

        if (!quantity || quantity <= 0) {
            return response.status(400).send({ error: "Quantity must be a positive number" });
        }

        if (!outputDate) {
            return response.status(400).send({ error: "Output date is required" });
        }

        const newOutputDate = new Date(outputDate);
        if (isNaN(newOutputDate.getTime())) {
            return response.status(400).send({ error: "Invalid output date format" });
        }
        
        try {
            const connection = new Database("db/estoque.db");

            const statement = connection.prepare("SELECT * FROM products WHERE barcode = ?");
            const product = statement.get(barcode) as { barcode: string; name: string; quantity_in_stock: number; order_reference_days: number } | undefined;

            if (!product) {
                return response.status(404).send({ error: "Product not found" });
            }

            const stock = product.quantity_in_stock;
            
            if (quantity > stock) {
                return response.status(400).send({ error: "Insufficient stock for the requested output quantity" });
            }

            const uuid = crypto.randomUUID();

            const insertStatement = connection.prepare("INSERT INTO productOutput (uuid, product_fk, quantity, outputDate) VALUES (?, ?, ?, ?)");
            insertStatement.run(uuid, barcode, quantity, newOutputDate.toISOString());

            const newStock = stock - quantity;

            const updateProductStatement = connection.prepare("UPDATE products SET quantity_in_stock = ? WHERE barcode = ?");
            updateProductStatement.run(newStock, barcode);

            return response.status(201).send({ 
                productOutputId: uuid,
                productOutputQuantity: quantity,
                productOutputDate: newOutputDate.toISOString(),
                productBarcode: product.barcode,
                productName: product.name,
                productStock: newStock
             });

        } catch (error) {
            return response.status(500).send({ error: "Internal server error" });
        }
    }
}