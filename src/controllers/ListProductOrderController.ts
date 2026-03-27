import type { FastifyReply, FastifyRequest } from "fastify";
import type { ListProductOrdersUsecase, ListProductOrdersUsecaseInterface } from "../usecases/ListProductOrdersUsecase";

export class ListProductOrderController {
  private listProductOrdersUsecase: ListProductOrdersUsecaseInterface;

  constructor(listProductOrdersUsecase: ListProductOrdersUsecaseInterface) {
    this.listProductOrdersUsecase = listProductOrdersUsecase;
  }

  public async handle(
    request: FastifyRequest,
    response: FastifyReply
  ): Promise<FastifyReply> {
    const result = this.listProductOrdersUsecase.execute();

    if (result instanceof Error) {
      return response.status(400).send({ message: result.message });
    }

    const orders = Array.isArray(result) ? result : [];

    return response.status(200).send(
      orders.map((order) => ({
        uuid: order.getUuid(),
        product: order.getProduct().getName(),
        quantity: order.getQuantity(),
        orderDate: order.getOrderDate(),
        status: order.getStatus(),
      }))
    );
  }
}
