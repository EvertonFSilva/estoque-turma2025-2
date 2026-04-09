import type { FastifyRequest, FastifyReply } from "fastify";
import type { ProductOutputRepositoryInterface } from "../repositories/ProductOutputRepository";

export class GetProductOutputController {
  constructor(private readonly productOutputRepository: ProductOutputRepositoryInterface) {}

  public async handle(request: FastifyRequest, response: FastifyReply): Promise<FastifyReply> {
    const { productOutputId } = request.params as { productOutputId: string };

    const output = this.productOutputRepository.findByUuid(productOutputId);

    if (!output) {
      return response.status(404).send({ message: "Saída de produto não encontrada." });
    }

    return response.status(200).send({
      uuid: output.getUuid(),
      product: output.getProduct().getName(),
      productBarcode: output.getProduct().getBarcode(),
      quantity: output.getQuantity(),
      outputDate: output.getOutputDate(),
    });
  }
}
