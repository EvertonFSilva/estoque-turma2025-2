import type { FastifyRequest, FastifyReply } from "fastify";
import type { DeleteProductOrderUseCaseInterface } from "../usecases/DeleteProductOrderUseCase";


export class DeleteProductOrderController {
    private deleteProductOrderUseCase: DeleteProductOrderUseCaseInterface;

    constructor(deleteProductOrderUseCase: DeleteProductOrderUseCaseInterface){
        this.deleteProductOrderUseCase = deleteProductOrderUseCase;
    }

    public async handle(request: FastifyRequest, response: FastifyReply): Promise<FastifyReply> {
        const { productOrderId } = request.params as { productOrderId: string };

        if (!productOrderId) {
            return response.status(400).send({ error: "Product order ID is required" });
        }
        
        try {
            const result = this.deleteProductOrderUseCase.execute(productOrderId);
            
            if (result instanceof Error){
                if (result.message === "Product order not found") {
                    return response.status(404).send({ error: result.message });
                }
                else if (result.message === "Cannot delete product order with associated product input") {
                    return response.status(400).send({ error: result.message });
                }
                else {
                    return response.status(500).send({ message: result.message});
                } 
            }

            return response.status(200).send({ message: result.message });

        } catch (error) {
            return response.status(500).send({ error: "Internal server error" });
        }
    }
}