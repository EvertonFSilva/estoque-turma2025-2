import type { FastifyRequest, FastifyReply } from "fastify";
import Database from "better-sqlite3";


export class DeleteProductOrderController {
    public async handle(request: FastifyRequest, response: FastifyReply): Promise<FastifyReply> {
        const { productOrderId } = request.params as { productOrderId: string };

        if (!productOrderId) {
            return response.status(400).send({ error: "Product order ID is required" });
        }
        
        try {
            const connection = new Database("db/estoque.db");

            const getProductOrderStatement = connection.prepare("SELECT * FROM productOrder WHERE uuid = ?");
            const productOrder = getProductOrderStatement.get(productOrderId) as { uuid: string; product_fk: string; quantity: number; orderDate: string, status: string } | undefined;
            if (!productOrder) {
                return response.status(404).send({ error: "Product order not found" });
            }

            const getProductInputStatement = connection.prepare("SELECT * FROM productInput WHERE productOrder_fk = ?");
            const productInput = getProductInputStatement.get(productOrder.uuid) as { uuid: string; productOrder_fk: string; quantity: number; inputDate: string } | undefined;
            if (productInput) {
                return response.status(400).send({ error: "Cannot delete product order with associated product input" });
            }

            const deleteProductOrderStatement = connection.prepare("DELETE FROM productOrder WHERE uuid = ?");
            deleteProductOrderStatement.run(productOrder.uuid);

            return response.status(200).send({ 
                message: "Product Order deleted successfully",
             });

        } catch (error) {
            return response.status(500).send({ error: "Internal server error" });
        }
    }
}