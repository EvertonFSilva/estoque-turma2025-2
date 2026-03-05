import type { FastifyReply, FastifyRequest } from "fastify";
import Product from "../entities/Product";
import type { ListProductsUsecase } from "../usecases/ListProductsUsecase";

export class ListProductsController {
  private listProductsUsecase: ListProductsUsecase;

  constructor(listProductsUsecase: ListProductsUsecase) {
    this.listProductsUsecase = listProductsUsecase;
  }

  public async handle(
    _request: FastifyRequest,
    response: FastifyReply
  ): Promise<FastifyReply> {
    const result = this.listProductsUsecase.execute();

    if (result instanceof Error) {
      return response.status(400).send({ message: result.message });
    }

    return response.status(200).send(
      result.map((p) => ({
        barcode: p.getBarcode(),
        name: p.getName(),
        quantityInStock: p.getQuantityInStock(),
        orderReferenceDays: p.getOrderReferenceDays(),
      }))
    );
  }
}