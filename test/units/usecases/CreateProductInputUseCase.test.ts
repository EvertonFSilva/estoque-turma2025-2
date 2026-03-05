import { CreateProductInputUseCase } from "../../../src/usecases/CreateProductInputUseCase";
import ProductInput from "../../../src/entities/ProductInput";
import ProductOrder from "../../../src/entities/ProductOrder";
import Product from "../../../src/entities/Product";

describe("CreateProductInputUseCase", () => {
    const mockProductInputRepository = {
        save: jest.fn()
    };

    const mockProductOrderRepository = {
        findByUuid: jest.fn(),
        save: jest.fn(),
        updateStatus: jest.fn()
    };

    const mockProductRepository = {
        findByBarcode: jest.fn(),
        createProduct: jest.fn(),
        updateStock: jest.fn()
    };

    let useCase: CreateProductInputUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new CreateProductInputUseCase(
            mockProductInputRepository,
            mockProductOrderRepository,
            mockProductRepository
        );
    });

    test("should create product input successfully", () => {
        const product = Product.rebuild("123", "Test Product", 10, 7);
        const productOrder = ProductOrder.rebuild("order-001", product, 5, new Date("2026-01-01"), "opened");

        mockProductOrderRepository.findByUuid.mockReturnValue(productOrder);

        const result = useCase.execute("order-001", 5, new Date("2026-02-01"));

        expect(result).not.toBeInstanceOf(Error);
        if (!(result instanceof Error)) {
            expect(result.productInput).toBeInstanceOf(ProductInput);
            expect(result.newStock).toBe(15);
            expect(mockProductInputRepository.save).toHaveBeenCalledTimes(1);
            expect(mockProductOrderRepository.updateStatus).toHaveBeenCalledWith("order-001", "closed");
            expect(mockProductRepository.updateStock).toHaveBeenCalledWith("123", 15);
        }
    });

    test("should return error when product order not found", () => {
        mockProductOrderRepository.findByUuid.mockReturnValue(null);

        const result = useCase.execute("order-001", 5, new Date("2026-02-01"));

        expect(result).toBeInstanceOf(Error);
        if (result instanceof Error) {
            expect(result.message).toBe("Product order not found");
        }
    });

    test("should return error when product order is not opened", () => {
        const product = Product.rebuild("123", "Test Product", 10, 7);
        const productOrder = ProductOrder.rebuild("order-001", product, 5, new Date("2026-01-01"), "closed");

        mockProductOrderRepository.findByUuid.mockReturnValue(productOrder);

        const result = useCase.execute("order-001", 5, new Date("2026-02-01"));

        expect(result).toBeInstanceOf(Error);
        if (result instanceof Error) {
            expect(result.message).toBe("Product order is not in opened status");
        }
    });

    test("should return error when input date is before order date", () => {
        const product = Product.rebuild("123", "Test Product", 10, 7);
        const productOrder = ProductOrder.rebuild("order-001", product, 5, new Date("2026-01-01"), "opened");

        mockProductOrderRepository.findByUuid.mockReturnValue(productOrder);

        const result = useCase.execute("order-001", 5, new Date("2025-12-31"));

        expect(result).toBeInstanceOf(Error);
        if (result instanceof Error) {
            expect(result.message).toBe("Input date cannot be before the product order date");
        }
    });

    test("should return error when repository throws exception", () => {
        mockProductOrderRepository.findByUuid.mockImplementation(() => {
            throw new Error("Database error");
        });

        const result = useCase.execute("order-001", 5, new Date("2026-02-01"));

        expect(result).toBeInstanceOf(Error);
        if (result instanceof Error) {
            expect(result.message).toBe("Internal server error");
        }
    });

    test("should return error when product not found", () => {
        mockProductOrderRepository.findByUuid.mockImplementation(() => {
            throw new Error("Related product 123 not found");
        });

        const result = useCase.execute("order-001", 5, new Date("2026-02-01"));

        expect(result).toBeInstanceOf(Error);
        if (result instanceof Error) {
            expect(result.message).toBe("Product not found");
        }
    });
});
