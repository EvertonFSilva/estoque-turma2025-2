import type { FastifyRequest, FastifyReply } from "fastify";
import type { CreateProductInputUseCaseInterface } from "../usecases/CreateProductInputUseCase";
import ProductInput from "../entities/ProductInput";

export class CreateProductInputController {
    private createProductInputUseCase: CreateProductInputUseCaseInterface;

    constructor(createProductInputUseCase: CreateProductInputUseCaseInterface) {
        this.createProductInputUseCase = createProductInputUseCase;
    }

    public async handle(request: FastifyRequest, response: FastifyReply): Promise<FastifyReply> {
        const { productOrderId, quantity, inputDate } = request.body as { productOrderId: string; quantity: number; inputDate: string; };

        if (!productOrderId) {
            return response.status(400).send({ error: "Product order ID is required" });
        }

        if (!quantity || quantity <= 0) {
            return response.status(400).send({ error: "Quantity must be a positive number" });
        }

        if (!inputDate) {
            return response.status(400).send({ error: "Input date is required" });
        }

        const newInputDate = new Date(inputDate);
        if (isNaN(newInputDate.getTime())) {
            return response.status(400).send({ error: "Invalid input date format" });
        }

        try {
            const result = this.createProductInputUseCase.execute(productOrderId, quantity, newInputDate);

            if (result instanceof Error) {
                if (result.message === "Product order not found" || result.message === "Product not found") {
                    return response.status(404).send({ error: result.message });
                }
                if (result.message === "Internal server error") {
                    return response.status(500).send({ error: result.message });
                }
                return response.status(400).send({ error: result.message });
            }

            const { productInput, productOrder, newStock } = result;
            const product = productOrder.getProduct();

            return response.status(201).send({
                productInputId: productInput.getUuid(),
                productInputQuantity: productInput.getQuantity(),
                productInputDate: productInput.getInputDate().toISOString(),
                productOrderId: productOrder.getUuid(),
                productOrderDate: productOrder.getOrderDate().toISOString(),
                productOrderStatus: "closed",
                productBarcode: product.getBarcode(),
                productName: product.getName(),
                productStock: newStock
            });
        } catch (error) {
            return response.status(500).send({ error: "Internal server error" });
        }
    }
}