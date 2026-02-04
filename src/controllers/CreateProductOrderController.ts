import type { FastifyRequest, FastifyReply } from "fastify";
import type { CreateProductOrderUsecase } from "../usecases/CreateProductOrderUsecase";
import ProductOrder from "../entities/ProductOrder";

export class CreateProductOrderController {

    private createProductOrderUseCase: CreateProductOrderUsecase;

    constructor(createProductOrderUseCase: CreateProductOrderUsecase) {
        this.createProductOrderUseCase = createProductOrderUseCase;
    }

    public async handle(request: FastifyRequest, response: FastifyReply): Promise<FastifyReply> {
        const { barcode, quantity, orderDate } = request.body as { barcode: string; quantity: number; orderDate: Date; };

        const result = this.createProductOrderUseCase.execute(barcode, quantity, orderDate);
        if (result instanceof ProductOrder) {
            return response.status(201).send({
                product: result.getProduct(),
                quantity: result.getQuantity(),
                orderDate: result.getOrderDate()
            });
        }
        return response.status(400).send({ message: result.message });
    }     
}

