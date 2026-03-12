import { DeleteProductOutputUseCase } from "../../../src/usecases/DeleteProductOutputUsecase";
import Product from "../../../src/entities/Product";
import ProductOutput from "../../../src/entities/ProductOutput";

describe("DeleteProductOutputUseCase", () => {

    const mockOutputRepo = {
        save: jest.fn(),
        findByUuid: jest.fn(),
        delete: jest.fn()
    };

    const mockProductRepo = {
        findByBarcode: jest.fn(),
        createProduct: jest.fn(),
        updateStock: jest.fn(),
        listAll: jest.fn()
    };

    let useCase: DeleteProductOutputUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new DeleteProductOutputUseCase(
            mockOutputRepo,
            mockProductRepo
        );
    });

    test("should delete output and update stock", () => {
        const product = Product.rebuild("123", "Test", 10, 7);
        const output = ProductOutput.rebuild("output-001", product, 5, new Date());

        mockOutputRepo.findByUuid.mockReturnValue(output);

        const result = useCase.execute("output-001");

        expect(result).not.toBeInstanceOf(Error);
        expect(mockOutputRepo.delete).toHaveBeenCalledWith("output-001");
        expect(mockProductRepo.updateStock).toHaveBeenCalledWith("123", 15);
    });

    test("should return error if product output not found", () => {
        mockOutputRepo.findByUuid.mockReturnValue(null);

        const result = useCase.execute("output-002");

        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe("Product output not found");
        expect(mockOutputRepo.delete).not.toHaveBeenCalled();
        expect(mockProductRepo.updateStock).not.toHaveBeenCalled();
    });

});