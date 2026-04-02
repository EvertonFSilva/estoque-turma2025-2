import type { FastifyRequest, FastifyReply } from "fastify";
import type { GetProductInputUsecase } from "../usecases/GetProductInputUsecase";
import ProductInput from "../entities/ProductInput";

export class GetProductInputController {

    private getProductInputUsecase: GetProductInputUsecase;

    constructor(getProductInputUsecase: GetProductInputUsecase) {
        this.getProductInputUsecase = getProductInputUsecase;
    }

    public async handle(request: FastifyRequest, response: FastifyReply): Promise<FastifyReply> {
        const { productInputId } = request.params as { productInputId: string };

        const result = this.getProductInputUsecase.execute(productInputId);

        if (result instanceof ProductInput) {
            return response.status(200).send({
                uuid: result.getUuid(),
                productOrderId: result.getProductOrderId(),
                quantity: result.getQuantity(),
                inputDate: result.getInputDate().toISOString()
            });
        }
        return response.status(400).send({ message: result.message });
    }     
}
