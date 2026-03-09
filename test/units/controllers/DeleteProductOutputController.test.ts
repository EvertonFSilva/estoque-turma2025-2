import { DeleteProductOutputController } from "../../../src/controllers/DeleteProductOutputController";

describe("DeleteProductOutputController", () => {

    const mockUseCase = {
        execute: jest.fn()
    };

    let controller: DeleteProductOutputController;

    const makeRequestMock = (params: object): any => ({
        params
    });

    const makeResponseMock = (): any => ({
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
    });

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new DeleteProductOutputController(mockUseCase);
    });

    test("should delete product output successfully", async () => {
        mockUseCase.execute.mockReturnValue({
            message: "Product output deleted successfully"
        });

        const request = makeRequestMock({ productOutputId: "output-001" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(200);
        expect(response.data.message).toBe("Product output deleted successfully");
    });

    test("should return 400 when id missing", async () => {
        const request = makeRequestMock({});
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(400);
    });

    test("should return 404 when output not found", async () => {
        mockUseCase.execute.mockReturnValue(
            new Error("Product output not found")
        );

        const request = makeRequestMock({ productOutputId: "output-001" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(404);
    });

    test("should return 500 on internal error", async () => {
        mockUseCase.execute.mockImplementation(() => { throw new Error("Internal server error"); });

        const request = makeRequestMock({ productOutputId: "output-002" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(500);
        expect(response.data.error).toBe("Internal server error");
    });

});