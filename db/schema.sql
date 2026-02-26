DROP TABLE IF EXISTS productOrder;
DROP TABLE IF EXISTS products;

CREATE TABLE products (
    barcode TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    quantity_in_stock INTEGER NOT NULL,
    order_reference_days INTEGER NOT NULL
);

CREATE TABLE productOrder (
    uuid TEXT PRIMARY KEY,
    product_fk TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    orderDate TEXT NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY (product_fk) REFERENCES products(barcode)
);

CREATE TABLE productInput (
    uuid TEXT PRIMARY KEY,
    productOrder_fk TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    inputDate TEXT NOT NULL,
    FOREIGN KEY (productOrder_fk) REFERENCES productOrder(uuid)
);

CREATE TABLE productOutput (
    uuid TEXT PRIMARY KEY,
    product_fk TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    outputDate TEXT NOT NULL,
    FOREIGN KEY (product_fk) REFERENCES products(barcode)
);