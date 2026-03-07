import type { FastifyRequest, FastifyReply } from "fastify";
import type { DeleteProductInputUseCaseInterface } from "../usecases/DeleteProductInputUsecase";

export class DeleteProductInputController {
    private deleteProductInputUseCase: DeleteProductInputUseCaseInterface;

    constructor(deleteProductInputUseCase: DeleteProductInputUseCaseInterface) {
        this.deleteProductInputUseCase = deleteProductInputUseCase;
    }

    public async handle(request: FastifyRequest, response: FastifyReply): Promise<FastifyReply> {
        const { productInputId } = request.params as { productInputId: string };

        if (!productInputId) {
            return response.status(400).send({ error: "Product input ID is required" });
        }

        try {
            const result = this.deleteProductInputUseCase.execute(productInputId);

            if (result instanceof Error) {
                if (result.message === "Product input not found" || result.message === "Product order not found" || result.message === "Product not found") {
                    return response.status(404).send({ error: result.message });
                }
                if (result.message === "Internal server error") {
                    return response.status(500).send({ error: result.message });
                }
                return response.status(400).send({ error: result.message });
            }

            return response.status(200).send({ message: result.message });
        } catch (error) {
            return response.status(500).send({ error: "Internal server error" });
        }
    }
}