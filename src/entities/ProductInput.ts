export default class ProductInput {
    private uuid: string;
    private productOrderId: string;
    private quantity: number;
    private inputDate: Date;

    private constructor(uuid: string, productOrderId: string, quantity: number, inputDate: Date) {
        this.uuid = uuid;
        this.productOrderId = productOrderId;
        this.quantity = quantity;
        this.inputDate = inputDate;
    }

    public static rebuild(uuid: string, productOrderId: string, quantity: number, inputDate: Date): ProductInput {
        return new ProductInput(uuid, productOrderId, quantity, inputDate);
    }

    public static create(productOrderId: string, quantity: number, inputDate: Date): ProductInput | Error {
        if (!productOrderId) {
            return new Error("Product order ID is required");
        }
        if (!quantity || quantity <= 0) {
            return new Error("Quantity must be a positive number");
        }
        if (!inputDate || isNaN(inputDate.getTime())) {
            return new Error("Invalid input date");
        }

        const uuid = crypto.randomUUID();
        return new ProductInput(uuid, productOrderId, quantity, inputDate);
    }

    public getUuid(): string {
        return this.uuid;
    }

    public getProductOrderId(): string {
        return this.productOrderId;
    }

    public getQuantity(): number {
        return this.quantity;
    }

    public getInputDate(): Date {
        return this.inputDate;
    }
}
