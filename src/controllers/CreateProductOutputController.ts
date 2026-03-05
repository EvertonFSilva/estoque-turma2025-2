import type { FastifyRequest, FastifyReply } from "fastify";
import type { CreateProductOutputUsecase } from "../usecases/CreateProductOutputUsecase";
import type { ProductRepositoryInterface } from "../repositories/ProductRepository";


export class CreateProductOutputController {

    private createProductOutputUsecase: CreateProductOutputUsecase;
    private productRepository: ProductRepositoryInterface;

    constructor(createProductOutputUsecase: CreateProductOutputUsecase, productRepository: ProductRepositoryInterface) {
        this.createProductOutputUsecase = createProductOutputUsecase;
        this.productRepository = productRepository;
    }

    public async handle(request: FastifyRequest, response: FastifyReply): Promise<FastifyReply> {
        const { barcode, quantity, outputDate } = request.body as { barcode: string; quantity: number; outputDate: string; };
            
        const result = this.createProductOutputUsecase.execute(barcode, quantity, new Date(outputDate));

        if (result instanceof Error) {
            console.log("Error creating product output:", result);
            return response.status(400).send({ error: result.message });
        }

        const updatedProduct = this.productRepository.findByBarcode(barcode);

        return response.status(201).send({ 
            productOutputId: result.getUuid(),
            productOutputQuantity: quantity,
            productOutputDate: result.getOutputDate().toISOString(),
            productBarcode: result.getProduct().getBarcode(),
            productName: result.getProduct().getName(),
            productStock: updatedProduct?.getQuantityInStock() ?? 0
        });
    }
}