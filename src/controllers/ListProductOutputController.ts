import type { FastifyReply, FastifyRequest } from "fastify";
import type { ListProductOutputUsecaseInterface } from "../usecases/ListProductOutputUsecase";

export class ListProductOutputController {
  private listProductOutputUsecase: ListProductOutputUsecaseInterface;

  constructor(listProductOutputUsecase: ListProductOutputUsecaseInterface) {
    this.listProductOutputUsecase = listProductOutputUsecase;
  }

  public async handle(
    request: FastifyRequest,
    response: FastifyReply
  ): Promise<FastifyReply> {
    const result = this.listProductOutputUsecase.execute();

    if (result instanceof Error) {
      return response.status(400).send({ message: result.message });
    }

    const outputs = Array.isArray(result) ? result : [];

    return response.status(200).send(
      outputs.map((output) => ({
        uuid: output.getUuid(),
        product: output.getProduct().getName(),
        quantity: output.getQuantity(),
        outputDate: output.getOutputDate(),
      }))
    );
  }
}
