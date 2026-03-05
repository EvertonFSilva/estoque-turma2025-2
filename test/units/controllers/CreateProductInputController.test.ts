import { CreateProductInputController } from "../../../src/controllers/CreateProductInputController";
import ProductInput from "../../../src/entities/ProductInput";
import ProductOrder from "../../../src/entities/ProductOrder";
import Product from "../../../src/entities/Product";

describe("CreateProductInputController", () => {
    const mockUseCase = {
        execute: jest.fn()
    };

    let controller: CreateProductInputController;

    const makeRequestMock = (body: object): any => ({ body });

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
        controller = new CreateProductInputController(mockUseCase);
    });

    test("should return 201 when product input is created successfully", async () => {
        const product = Product.rebuild("123", "Test Product", 10, 7);
        const productOrder = ProductOrder.rebuild("order-001", product, 5, new Date("2026-01-01"), "opened");
        const productInput = ProductInput.create("order-001", 5, new Date("2026-02-01")) as ProductInput;

        mockUseCase.execute.mockReturnValue({
            productInput,
            productOrder,
            newStock: 15
        });

        const request = makeRequestMock({
            productOrderId: "order-001",
            quantity: 5,
            inputDate: "2026-02-01T00:00:00.000Z"
        });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(201);
        expect(response.data.productInputId).toBeDefined();
        expect(response.data.productInputQuantity).toBe(5);
        expect(response.data.productOrderStatus).toBe("closed");
        expect(response.data.productStock).toBe(15);
    });

    test("should return 400 when productOrderId is missing", async () => {
        const request = makeRequestMock({ quantity: 5, inputDate: "2026-02-01" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(400);
        expect(response.data.error).toBe("Product order ID is required");
    });

    test("should return 400 when quantity is missing", async () => {
        const request = makeRequestMock({ productOrderId: "order-001", inputDate: "2026-02-01" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(400);
        expect(response.data.error).toBe("Quantity must be a positive number");
    });

    test("should return 400 when quantity is zero", async () => {
        const request = makeRequestMock({ productOrderId: "order-001", quantity: 0, inputDate: "2026-02-01" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(400);
        expect(response.data.error).toBe("Quantity must be a positive number");
    });

    test("should return 400 when quantity is negative", async () => {
        const request = makeRequestMock({ productOrderId: "order-001", quantity: -5, inputDate: "2026-02-01" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(400);
        expect(response.data.error).toBe("Quantity must be a positive number");
    });

    test("should return 400 when inputDate is missing", async () => {
        const request = makeRequestMock({ productOrderId: "order-001", quantity: 5 });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(400);
        expect(response.data.error).toBe("Input date is required");
    });

    test("should return 400 when inputDate is invalid", async () => {
        const request = makeRequestMock({ productOrderId: "order-001", quantity: 5, inputDate: "invalid-date" });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(400);
        expect(response.data.error).toBe("Invalid input date format");
    });

    test("should return 404 when product order not found", async () => {
        mockUseCase.execute.mockReturnValue(new Error("Product order not found"));

        const request = makeRequestMock({
            productOrderId: "order-001",
            quantity: 5,
            inputDate: "2026-02-01T00:00:00.000Z"
        });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(404);
        expect(response.data.error).toBe("Product order not found");
    });

    test("should return 400 when product order is not opened", async () => {
        mockUseCase.execute.mockReturnValue(new Error("Product order is not in opened status"));

        const request = makeRequestMock({
            productOrderId: "order-001",
            quantity: 5,
            inputDate: "2026-02-01T00:00:00.000Z"
        });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(400);
        expect(response.data.error).toBe("Product order is not in opened status");
    });

    test("should return 400 when input date is before order date", async () => {
        mockUseCase.execute.mockReturnValue(new Error("Input date cannot be before the product order date"));

        const request = makeRequestMock({
            productOrderId: "order-001",
            quantity: 5,
            inputDate: "2026-02-01T00:00:00.000Z"
        });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(400);
        expect(response.data.error).toBe("Input date cannot be before the product order date");
    });

    test("should return 404 when product not found", async () => {
        mockUseCase.execute.mockReturnValue(new Error("Product not found"));

        const request = makeRequestMock({
            productOrderId: "order-001",
            quantity: 5,
            inputDate: "2026-02-01T00:00:00.000Z"
        });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(404);
        expect(response.data.error).toBe("Product not found");
    });

    test("should return 500 when internal server error from usecase", async () => {
        mockUseCase.execute.mockReturnValue(new Error("Internal server error"));

        const request = makeRequestMock({
            productOrderId: "order-001",
            quantity: 5,
            inputDate: "2026-02-01T00:00:00.000Z"
        });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(500);
        expect(response.data.error).toBe("Internal server error");
    });

    test("should return 500 when an unexpected error occurs", async () => {
        mockUseCase.execute.mockImplementation(() => {
            throw new Error("Unexpected error");
        });

        const request = makeRequestMock({
            productOrderId: "order-001",
            quantity: 5,
            inputDate: "2026-02-01T00:00:00.000Z"
        });
        const response = makeResponseMock();

        await controller.handle(request, response);

        expect(response.statusCode).toBe(500);
        expect(response.data.error).toBe("Internal server error");
    });
});
