import { ListProductInputsUsecase } from "../../../src/usecases/ListProductInputsUsecase";
import ProductInput from "../../../src/entities/ProductInput";

describe("ListProductInputsUsecase", () => {
    const mockProductInputRepository = {
        save: jest.fn(),
        findByUuid: jest.fn(),
        findByProductOrder_fk: jest.fn(),
        listAll: jest.fn(),
        delete: jest.fn()
    };

    let useCase: ListProductInputsUsecase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new ListProductInputsUsecase(mockProductInputRepository);
    });

    test("should return all product inputs successfully", () => {
        const input1 = ProductInput.rebuild("uuid-1", "order-001", 5, new Date("2026-02-01"));
        const input2 = ProductInput.rebuild("uuid-2", "order-002", 10, new Date("2026-03-01"));

        mockProductInputRepository.listAll.mockReturnValue([input1, input2]);

        const result = useCase.execute();

        expect(result).not.toBeInstanceOf(Error);
        if (!(result instanceof Error)) {
            expect(result).toHaveLength(2);
            expect(result[0].getUuid()).toBe("uuid-1");
            expect(result[1].getUuid()).toBe("uuid-2");
        }
        expect(mockProductInputRepository.listAll).toHaveBeenCalledTimes(1);
    });

    test("should return an empty array when there are no product inputs", () => {
        mockProductInputRepository.listAll.mockReturnValue([]);

        const result = useCase.execute();

        expect(result).not.toBeInstanceOf(Error);
        if (!(result instanceof Error)) {
            expect(result).toHaveLength(0);
        }
    });

    test("should return error when repository throws exception", () => {
        mockProductInputRepository.listAll.mockImplementation(() => {
            throw new Error("Database error");
        });

        const result = useCase.execute();

        expect(result).toBeInstanceOf(Error);
        if (result instanceof Error) {
            expect(result.message).toBe("Error listing product inputs");
        }
    });
});
