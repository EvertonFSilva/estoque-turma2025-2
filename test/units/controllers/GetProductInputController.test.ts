import ProductInput from "../../../src/entities/ProductInput";
import { GetProductInputController } from "../../../src/controllers/GetProductInputController";
import type { GetProductInputUsecase } from "../../../src/usecases/GetProductInputUsecase";
import type { GetProductInputUsecaseInterface } from "../../../src/usecases/GetProductInputUsecase";

describe("GetProductInputController", () => {
    test("should return 200 if the product input is found successfully", async () => {

        class GetProductInputUsecaseMock implements GetProductInputUsecaseInterface {
            execute(uuid: string): ProductInput | Error {
                return ProductInput.rebuild(uuid, "order-001", 5, new Date("2026-02-01T00:00:00.000Z"));
            }
        }

        const usecase = new GetProductInputUsecaseMock();
        const controller = new GetProductInputController(usecase as GetProductInputUsecase);

        const requestMock: any = {
            params: {
                productInputId: "uuid-123"
            }
        };

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
        expect(responseMock.data).toEqual({
            uuid: "uuid-123",
            productOrderId: "order-001",
            quantity: 5,
            inputDate: "2026-02-01T00:00:00.000Z"
        });
    });

    test("should return 400 if the usecase returns an ERROR", async () => {

        class GetProductInputUsecaseMock implements GetProductInputUsecaseInterface {
            execute(uuid: string): ProductInput | Error {
                return new Error("Product input not found");
            }
        }

        const usecase = new GetProductInputUsecaseMock();
        const controller = new GetProductInputController(usecase as GetProductInputUsecase);

        const requestMock: any = {
            params: {
                productInputId: "nonexistent-uuid"
            }
        };

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
        expect(responseMock.data).toEqual({
            message: "Product input not found"
        });
    });
});
