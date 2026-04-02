import { GetProductInputUsecase } from "../../../src/usecases/GetProductInputUsecase";
import ProductInput from "../../../src/entities/ProductInput";

describe("GetProductInputUsecase", () => {
    const mockProductInputRepository = {
        save: jest.fn(),
        findByUuid: jest.fn(),
        findByProductOrder_fk: jest.fn(),
        listAll: jest.fn(),
        delete: jest.fn()
    };

    let useCase: GetProductInputUsecase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new GetProductInputUsecase(mockProductInputRepository);
    });

    test("should return a product input successfully", () => {
        const input = ProductInput.rebuild("uuid-1", "order-001", 5, new Date("2026-02-01"));
        mockProductInputRepository.findByUuid.mockReturnValue(input);

        const result = useCase.execute("uuid-1");

        expect(result).not.toBeInstanceOf(Error);
        if (!(result instanceof Error)) {
            expect(result.getUuid()).toBe("uuid-1");
            expect(result.getProductOrderId()).toBe("order-001");
            expect(result.getQuantity()).toBe(5);
        }
        expect(mockProductInputRepository.findByUuid).toHaveBeenCalledWith("uuid-1");
    });

    test("should return error when product input is not found", () => {
        mockProductInputRepository.findByUuid.mockReturnValue(null);

        const result = useCase.execute("nonexistent-uuid");

        expect(result).toBeInstanceOf(Error);
        if (result instanceof Error) {
            expect(result.message).toBe("Product input not found");
        }
    });

    test("should return error when repository throws exception", () => {
        mockProductInputRepository.findByUuid.mockImplementation(() => {
            throw new Error("Database error");
        });

        const result = useCase.execute("uuid-1");

        expect(result).toBeInstanceOf(Error);
        if (result instanceof Error) {
            expect(result.message).toBe("Error retrieving product input");
        }
    });
});
