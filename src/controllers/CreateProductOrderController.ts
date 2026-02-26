import type { FastifyRequest, FastifyReply } from "fastify";
import type { CreateProductOrderUsecase } from "../usecases/CreateProductOrderUsecase";
import ProductOrder from "../entities/ProductOrder";

export class CreateProductOrderController {
    private createProductOrderUseCase: CreateProductOrderUsecase;

    constructor(createProductOrderUseCase: CreateProductOrderUsecase) {
        this.createProductOrderUseCase = createProductOrderUseCase;
    }

    public async handle(request: FastifyRequest, response: FastifyReply): Promise<FastifyReply> {
        const { barcode, quantity, orderDate } = request.body as { barcode: string; quantity: number; orderDate: any; };

        const parsedDate = new Date(orderDate);

        const result = this.createProductOrderUseCase.execute(barcode, quantity, parsedDate);

        if (result instanceof ProductOrder) {
            return response.status(201).send({
                productOrderId: result.getUuid(),
                quantity: result.getQuantity(),
                orderDate: result.getOrderDate(),
                status: result.getStatus(),
                product: result.getProduct()
            });
        }

        const errorMessage = result instanceof Error ? result.message : "Unknown error";
        return response.status(400).send({ message: errorMessage });
    }     
}