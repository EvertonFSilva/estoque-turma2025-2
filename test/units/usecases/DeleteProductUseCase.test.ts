import { DeleteProductUseCase } from "../../../src/usecases/DeleteProductUseCase";
import Product from "../../../src/entities/Product";

describe("DeleteProductUseCase", () => {

    const mockProductRepo = {
        findByBarcode: jest.fn(),
        createProduct: jest.fn(),
        updateStock: jest.fn(),
        listAll: jest.fn(),
        delete: jest.fn()
    };

    let useCase: DeleteProductUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new DeleteProductUseCase(mockProductRepo);
    });

    test("should delete product successfully", () => {

        const product = Product.rebuild("123", "Test", 10, 7);

        mockProductRepo.findByBarcode.mockReturnValue(product);
        mockProductRepo.delete.mockReturnValue(true);

        const result = useCase.execute("123");

        expect(result).not.toBeInstanceOf(Error);
        expect(mockProductRepo.delete).toHaveBeenCalledWith("123");

        expect(result).toEqual({
            message: "Product deleted successfully"
        });
    });

    test("should return error if product not found", () => {

        mockProductRepo.findByBarcode.mockReturnValue(null);

        const result = useCase.execute("123");

        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe("Product not found");

        expect(mockProductRepo.delete).not.toHaveBeenCalled();
    });

    test("should return error if delete fails", () => {

        const product = Product.rebuild("123", "Test", 10, 7);

        mockProductRepo.findByBarcode.mockReturnValue(product);
        mockProductRepo.delete.mockReturnValue(false);

        const result = useCase.execute("123");

        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe("Internal server error");
    });

});