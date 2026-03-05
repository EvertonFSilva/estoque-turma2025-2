import ProductInput from "../../../src/entities/ProductInput";

describe("ProductInput Entity", () => {
    test("should create a valid ProductInput", () => {
        const result = ProductInput.create("order-123", 10, new Date("2026-01-01"));

        expect(result).toBeInstanceOf(ProductInput);
        if (result instanceof ProductInput) {
            expect(result.getProductOrderId()).toBe("order-123");
            expect(result.getQuantity()).toBe(10);
            expect(result.getInputDate()).toEqual(new Date("2026-01-01"));
            expect(result.getUuid()).toBeDefined();
        }
    });

    test("should return error when productOrderId is empty", () => {
        const result = ProductInput.create("", 10, new Date("2026-01-01"));

        expect(result).toBeInstanceOf(Error);
        if (result instanceof Error) {
            expect(result.message).toBe("Product order ID is required");
        }
    });

    test("should return error when quantity is zero", () => {
        const result = ProductInput.create("order-123", 0, new Date("2026-01-01"));

        expect(result).toBeInstanceOf(Error);
        if (result instanceof Error) {
            expect(result.message).toBe("Quantity must be a positive number");
        }
    });

    test("should return error when quantity is negative", () => {
        const result = ProductInput.create("order-123", -5, new Date("2026-01-01"));

        expect(result).toBeInstanceOf(Error);
        if (result instanceof Error) {
            expect(result.message).toBe("Quantity must be a positive number");
        }
    });

    test("should return error when inputDate is invalid", () => {
        const result = ProductInput.create("order-123", 10, new Date("invalid"));

        expect(result).toBeInstanceOf(Error);
        if (result instanceof Error) {
            expect(result.message).toBe("Invalid input date");
        }
    });
});
