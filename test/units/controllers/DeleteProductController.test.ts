import { DeleteProductController } from "../../../src/controllers/DeleteProductController";

describe("DeleteProductController", () => {

    const mockUseCase = {
        execute: jest.fn()
    };

    let controller: DeleteProductController;

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
        controller = new DeleteProductController(mockUseCase);
    });

    test("should delete product successfully", async () => {

        mockUseCase.execute.mockReturnValue({
            message: "Product deleted successfully"
        });

        const request = makeRequestMock({ barcode: "123" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(200);
        expect(response.data.message).toBe("Product deleted successfully");
    });

    test("should return 400 when barcode missing", async () => {

        const request = makeRequestMock({});
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(400);
    });

    test("should return 404 when product not found", async () => {

        mockUseCase.execute.mockReturnValue(
            new Error("Product not found")
        );

        const request = makeRequestMock({ barcode: "123" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(404);
    });

    test("should return 500 on internal error via exception", async () => {

        mockUseCase.execute.mockImplementation(() => {
            throw new Error("Internal server error");
        });

        const request = makeRequestMock({ barcode: "123" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(500);
        expect(response.data.error).toBe("Internal server error");
    });

    test("should return 500 on internal error", async () => {

        mockUseCase.execute.mockReturnValue(
            new Error("Internal server error")
        );

        const request = makeRequestMock({ barcode: "123" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(500);
        expect(response.data.error).toBe("Internal server error");
    });

    test("should return 400 for other errors", async () => {

        mockUseCase.execute.mockReturnValue(
            new Error("any error")
        );

        const request = makeRequestMock({ barcode: "123" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(400);
        expect(response.data.error).toBe("any error");
    });

});