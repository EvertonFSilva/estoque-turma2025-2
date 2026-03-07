import { randomUUID } from 'crypto';
import Product from './Product';

export default class ProductOrder {
    private uuid: string;
    private product: Product;
    private quantity: number;
    private orderDate: Date;
    private status: string;

    private constructor(uuid: string, product: Product, quantity: number, orderDate: Date, status: string) {
        this.uuid = uuid;
        this.product = product;
        this.quantity = quantity;
        this.status = status;
        this.orderDate = orderDate;
    }

    public static create(product: Product, quantity: number, orderDate: Date): ProductOrder | Error {
        if (!product || !(product instanceof Product)) {
            return new Error("Product cannot be null or invalid");
        }
        if (quantity <= 0) {
            return new Error("Quantity must be positive");
        }
        if (isNaN(orderDate.getTime())) {
            return new Error("Order date must be valid");
        }

        const uuid = randomUUID();
        const status = "opened";
        return new ProductOrder(uuid, product, quantity, orderDate, status);
    }

// GenerateUuid deve ser feito aqui ou no banco?

    public static rebuild(uuid: string, product: Product, quantity: number, orderDate: Date, status: string): ProductOrder {
        return new ProductOrder(uuid, product, quantity, orderDate, status);
    }

    public getUuid(): string {
        return this.uuid;
    }

    public getStatus(): string {
        return this.status;
    }

    public getProduct(): Product {
        return this.product;
    }

    public getQuantity(): number {
        return this.quantity;
    }

    public getOrderDate(): Date {
        return this.orderDate;
    }

    public closeProductOrder() {
        this.status = "closed";
    }

    public openProductOrder() {
        this.status = "opened";
    }
}