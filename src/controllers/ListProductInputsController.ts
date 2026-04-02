import type { FastifyReply, FastifyRequest } from "fastify";
import type { ListProductInputsUsecase, ListProductInputsUsecaseInterface } from "../usecases/ListProductInputsUsecase";

export class ListProductInputsController {
  private listProductInputsUsecase: ListProductInputsUsecaseInterface;

  constructor(listProductInputsUsecase: ListProductInputsUsecaseInterface) {
    this.listProductInputsUsecase = listProductInputsUsecase;
  }

  public async handle(
    request: FastifyRequest,
    response: FastifyReply
  ): Promise<FastifyReply> {
    const result = this.listProductInputsUsecase.execute();

    if (result instanceof Error) {
      return response.status(400).send({ message: result.message });
    }

    return response.status(200).send(
      result.map((input) => ({
        uuid: input.getUuid(),
        productOrderId: input.getProductOrderId(),
        quantity: input.getQuantity(),
        inputDate: input.getInputDate().toISOString(),
      }))
    );
  }
}
