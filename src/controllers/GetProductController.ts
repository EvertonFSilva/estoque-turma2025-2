import type { FastifyRequest, FastifyReply } from "fastify";
import type { GetProductUsecase } from "../usecases/GetProductUsecase";
import Product from "../entities/Product";

export class GetProductController {

    private getProductUsecase: GetProductUsecase;

    constructor(getProductUsecase: GetProductUsecase) {
        this.getProductUsecase = getProductUsecase;
    }

    public async handle(request: FastifyRequest, response: FastifyReply): Promise<FastifyReply> {
        const { barcode} = request.body as { barcode: string;};

        const result = this.getProductUsecase.execute(barcode);

        if (result instanceof Product) {
            return response.status(200).send({
                barcode: result.getBarcode(),
                name: result.getName(),
                quantityInStock: result.getQuantityInStock(),
                orderReferenceDays: result.getOrderReferenceDays()
            });
        }
        return response.status(400).send({ message: result.message });
    }     
}

