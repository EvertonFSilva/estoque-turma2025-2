import type { FastifyRequest, FastifyReply } from "fastify";
import type { DeleteProductUseCaseInterface } from "../usecases/DeleteProductUseCase";

export class DeleteProductController {

    private deleteProductUseCase: DeleteProductUseCaseInterface;

    constructor(deleteProductUseCase: DeleteProductUseCaseInterface) {
        this.deleteProductUseCase = deleteProductUseCase;
    }

    public async handle(request: FastifyRequest, response: FastifyReply): Promise<FastifyReply> {

        const { barcode } = request.params as { barcode: string };

        if (!barcode) {
            return response.status(400).send({ error: "Product barcode is required" });
        }

        try {

            const result = this.deleteProductUseCase.execute(barcode);

            if (result instanceof Error) {

                if (result.message === "Product not found") {
                    return response.status(404).send({ error: result.message });
                }

                if (result.message === "Internal server error") {
                    return response.status(500).send({ error: result.message });
                }

                return response.status(400).send({ error: result.message });
            }

            return response.status(200).send({
                message: result.message
            });

        } catch (error) {
            return response.status(500).send({
                error: "Internal server error"
            });
        }
    }
}