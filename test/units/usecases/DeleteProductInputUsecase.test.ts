import { DeleteProductInputUseCase } from "../../../src/usecases/DeleteProductInputUsecase";
import ProductInput from "../../../src/entities/ProductInput";
import ProductOrder from "../../../src/entities/ProductOrder";
import Product from "../../../src/entities/Product";

describe("DeleteProductInputUseCase", () => {
    const mockProductInputRepository = {
        save: jest.fn(),
        findByUuid: jest.fn(),
        delete: jest.fn()
    };

    const mockProductOrderRepository = {
        findByUuid: jest.fn(),
        save: jest.fn(),
        updateStatus: jest.fn()
    };

    const mockProductRepository = {
        findByBarcode: jest.fn(),
        createProduct: jest.fn(),
        updateStock: jest.fn(),
        listAll: jest.fn()
    };

    let useCase: DeleteProductInputUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new DeleteProductInputUseCase(
            mockProductInputRepository,
            mockProductOrderRepository,
            mockProductRepository
        );
    });

    test("should delete product input and update stock successfully", () => {
        const product = Product.rebuild("123", "Test Product", 15, 7);
        const productOrder = ProductOrder.rebuild("order-001", product, 5, new Date("2026-01-01"), "closed");
        const productInput = ProductInput.rebuild("input-001", "order-001", 5, new Date("2026-02-01"));

        mockProductInputRepository.findByUuid.mockReturnValue(productInput);
        mockProductOrderRepository.findByUuid.mockReturnValue(productOrder);

        const result = useCase.execute("input-001");

        expect(result).not.toBeInstanceOf(Error);
        expect((result as { message: string }).message).toBe("Product input deleted successfully");
        expect(mockProductInputRepository.delete).toHaveBeenCalledWith("input-001");
        expect(mockProductOrderRepository.updateStatus).toHaveBeenCalled();
        expect(mockProductRepository.updateStock).toHaveBeenCalledWith("123", 10);
    });

    test("should return error when product input not found", () => {
        mockProductInputRepository.findByUuid.mockReturnValue(null);

        const result = useCase.execute("input-001");

        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe("Product input not found");
    });

    test("should return error when product order not found", () => {
        const productInput = ProductInput.rebuild("input-001", "order-001", 5, new Date("2026-02-01"));
        mockProductInputRepository.findByUuid.mockReturnValue(productInput);
        mockProductOrderRepository.findByUuid.mockReturnValue(null);

        const result = useCase.execute("input-001");

        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe("Product order not found");
    });

    test("should return error when deletion would result in negative stock", () => {
        const product = Product.rebuild("123", "Test Product", 3, 7);
        const productOrder = ProductOrder.rebuild("order-001", product, 5, new Date("2026-01-01"), "closed");
        const productInput = ProductInput.rebuild("input-001", "order-001", 5, new Date("2026-02-01"));

        mockProductInputRepository.findByUuid.mockReturnValue(productInput);
        mockProductOrderRepository.findByUuid.mockReturnValue(productOrder);

        const result = useCase.execute("input-001");

        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe("Cannot delete product input as it would result in negative stock");
        expect(mockProductInputRepository.delete).not.toHaveBeenCalled();
    });

    test("should return error when product not found via repository exception", () => {
        const productInput = ProductInput.rebuild("input-001", "order-001", 5, new Date("2026-02-01"));
        mockProductInputRepository.findByUuid.mockReturnValue(productInput);
        mockProductOrderRepository.findByUuid.mockImplementation(() => {
            throw new Error("Related product NONEXISTENT not found");
        });

        const result = useCase.execute("input-001");

        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe("Product not found");
    });

    test("should return internal server error on unexpected exception", () => {
        const productInput = ProductInput.rebuild("input-001", "order-001", 5, new Date("2026-02-01"));
        mockProductInputRepository.findByUuid.mockReturnValue(productInput);
        mockProductOrderRepository.findByUuid.mockImplementation(() => {
            throw new Error("Database connection failed");
        });

        const result = useCase.execute("input-001");

        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe("Internal server error");
    });
});
