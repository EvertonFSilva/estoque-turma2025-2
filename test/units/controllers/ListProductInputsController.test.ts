import ProductInput from "../../../src/entities/ProductInput";
import { ListProductInputsController } from "../../../src/controllers/ListProductInputsController";
import type { ListProductInputsUsecase } from "../../../src/usecases/ListProductInputsUsecase";
import type { ListProductInputsUsecaseInterface } from "../../../src/usecases/ListProductInputsUsecase";

describe("ListProductInputsController", () => {
    test("should return 200 with the list of product inputs", async () => {

        class ListProductInputsUsecaseMock implements ListProductInputsUsecaseInterface {
            execute(): ProductInput[] | Error {
                return [
                    ProductInput.rebuild("uuid-1", "order-001", 5, new Date("2026-02-01T00:00:00.000Z")),
                    ProductInput.rebuild("uuid-2", "order-002", 10, new Date("2026-03-01T00:00:00.000Z"))
                ];
            }
        }

        const usecase = new ListProductInputsUsecaseMock();
        const controller = new ListProductInputsController(usecase as ListProductInputsUsecase);

        const requestMock: any = {};
        const responseMock: any = {
            statusCode: 0,
            data: null,
            status(code: number) {
                this.statusCode = code;
                return this;
            },
            send(data: any) {
                this.data = data;
                return this;
            }
        };

        await controller.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(200);
        expect(responseMock.data).toEqual([
            {
                uuid: "uuid-1",
                productOrderId: "order-001",
                quantity: 5,
                inputDate: "2026-02-01T00:00:00.000Z"
            },
            {
                uuid: "uuid-2",
                productOrderId: "order-002",
                quantity: 10,
                inputDate: "2026-03-01T00:00:00.000Z"
            }
        ]);
    });

    test("should return 200 with empty array when there are no product inputs", async () => {

        class ListProductInputsUsecaseMock implements ListProductInputsUsecaseInterface {
            execute(): ProductInput[] | Error {
                return [];
            }
        }

        const usecase = new ListProductInputsUsecaseMock();
        const controller = new ListProductInputsController(usecase as ListProductInputsUsecase);

        const requestMock: any = {};
        const responseMock: any = {
            statusCode: 0,
            data: null,
            status(code: number) {
                this.statusCode = code;
                return this;
            },
            send(data: any) {
                this.data = data;
                return this;
            }
        };

        await controller.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(200);
        expect(responseMock.data).toEqual([]);
    });

    test("should return 400 if the usecase returns an ERROR", async () => {

        class ListProductInputsUsecaseMock implements ListProductInputsUsecaseInterface {
            execute(): ProductInput[] | Error {
                return new Error("Error listing product inputs");
            }
        }

        const usecase = new ListProductInputsUsecaseMock();
        const controller = new ListProductInputsController(usecase as ListProductInputsUsecase);

        const requestMock: any = {};
        const responseMock: any = {
            statusCode: 0,
            data: null,
            status(code: number) {
                this.statusCode = code;
                return this;
            },
            send(data: any) {
                this.data = data;
                return this;
            }
        };

        await controller.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(400);
        expect(responseMock.data).toEqual({ message: "Error listing product inputs" });
    });
});
