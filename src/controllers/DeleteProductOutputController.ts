import type { FastifyRequest, FastifyReply } from "fastify";
import type { DeleteProductOutputUseCaseInterface } from "../usecases/DeleteProductOutputUsecase";

export class DeleteProductOutputController {

    constructor(
        private deleteProductOutputUseCase: DeleteProductOutputUseCaseInterface
    ) { }

    public async handle(
        request: FastifyRequest,
        response: FastifyReply
    ): Promise<FastifyReply> {

        const { productOutputId } =
            request.params as { productOutputId: string };

        if (!productOutputId) {
            return response
                .status(400)
                .send({ error: "Product output ID is required" });
        }

        try {

            const result =
                this.deleteProductOutputUseCase.execute(productOutputId);

            if (result instanceof Error) {

                if (
                    result.message === "Product output not found" ||
                    result.message === "Product not found"
                ) {
                    return response.status(404).send({
                        error: result.message
                    });
                }

                if (result.message === "Internal server error") {
                    return response.status(500).send({
                        error: result.message
                    });
                }

                return response.status(400).send({
                    error: result.message
                });
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