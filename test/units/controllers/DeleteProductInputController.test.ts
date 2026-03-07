import { DeleteProductInputController } from "../../../src/controllers/DeleteProductInputController";

describe("DeleteProductInputController", () => {
    const mockUseCase = {
        execute: jest.fn()
    };

    let controller: DeleteProductInputController;

    const makeRequestMock = (params: object): any => ({ params });

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
        controller = new DeleteProductInputController(mockUseCase);
    });

    test("should return 200 when product input is deleted successfully", async () => {
        mockUseCase.execute.mockReturnValue({ message: "Product input deleted successfully" });

        const request = makeRequestMock({ productInputId: "input-001" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(200);
        expect(response.data.message).toBe("Product input deleted successfully");
        expect(mockUseCase.execute).toHaveBeenCalledWith("input-001");
    });

    test("should return 400 when productInputId is missing", async () => {
        const request = makeRequestMock({});
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(400);
        expect(response.data.error).toBe("Product input ID is required");
    });

    test("should return 404 when product input not found", async () => {
        mockUseCase.execute.mockReturnValue(new Error("Product input not found"));

        const request = makeRequestMock({ productInputId: "input-001" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(404);
        expect(response.data.error).toBe("Product input not found");
    });

    test("should return 404 when product order not found", async () => {
        mockUseCase.execute.mockReturnValue(new Error("Product order not found"));

        const request = makeRequestMock({ productInputId: "input-001" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(404);
        expect(response.data.error).toBe("Product order not found");
    });

    test("should return 404 when product not found", async () => {
        mockUseCase.execute.mockReturnValue(new Error("Product not found"));

        const request = makeRequestMock({ productInputId: "input-001" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(404);
        expect(response.data.error).toBe("Product not found");
    });

    test("should return 400 when deletion would result in negative stock", async () => {
        mockUseCase.execute.mockReturnValue(new Error("Cannot delete product input as it would result in negative stock"));

        const request = makeRequestMock({ productInputId: "input-001" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(400);
        expect(response.data.error).toBe("Cannot delete product input as it would result in negative stock");
    });

    test("should return 500 when internal server error from usecase", async () => {
        mockUseCase.execute.mockReturnValue(new Error("Internal server error"));

        const request = makeRequestMock({ productInputId: "input-001" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(500);
        expect(response.data.error).toBe("Internal server error");
    });

    test("should return 500 when an unexpected error occurs", async () => {
        mockUseCase.execute.mockImplementation(() => {
            throw new Error("Unexpected error");
        });

        const request = makeRequestMock({ productInputId: "input-001" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(500);
        expect(response.data.error).toBe("Internal server error");
    });
});
