import fastify from "fastify";
import cors from "@fastify/cors";

import { SqliteConnection } from "./repositories/SqliteConnection";
import { ProductRepository } from "./repositories/ProductRepository";
import { ProductOrderRepository } from "./repositories/ProductOrderRepository";
import { ProductInputRepository } from "./repositories/ProductInputRepository";
import { CreateProductUsecase } from "./usecases/CreateProductUsecase";
import { GetProductUsecase } from "./usecases/GetProductUsecase";
import { CreateProductOrderUsecase } from "./usecases/CreateProductOrderUsecase";
import { CreateProductInputUseCase } from "./usecases/CreateProductInputUseCase";
import { DeleteProductInputUseCase } from "./usecases/DeleteProductInputUsecase";
import { CreateProductController } from "./controllers/CreateProductController";
import { GetProductController } from "./controllers/GetProductController";
import { CreateProductOrderController } from "./controllers/CreateProductOrderController";
import { CreateProductInputController } from "./controllers/CreateProductInputController";
import { CreateProductOutputController } from "./controllers/CreateProductOutputController";
import { DeleteProductInputController } from "./controllers/DeleteProductInputController";
import { DeleteProductOutputController } from "./controllers/DeleteProductOutputController";
import { ListProductsUsecase } from "./usecases/ListProductsUsecase";
import { ListProductsController } from "./controllers/ListProductsController";
import { ProductOutputRepository } from "./repositories/ProductOutputRepository";
import { CreateProductOutputUsecase } from "./usecases/CreateProductOutputUsecase";
import { DeleteProductOutputUseCase } from "./usecases/DeleteProductOutputUsecase";
import { DeleteProductOrderUseCase } from "./usecases/DeleteProductOrderUseCase";
import { DeleteProductOrderController } from "./controllers/DeleteProductOrderController";
import { ListProductOrdersUsecase } from "./usecases/ListProductOrdersUsecase";
import { ListProductOrderController } from "./controllers/ListProductOrderController";
import { GetProductOrderController } from "./controllers/GetProductOrderController";

const sqliteConnection = new SqliteConnection("db/estoque.db");

const productRepository = new ProductRepository(sqliteConnection);
const productOrderRepository = new ProductOrderRepository(sqliteConnection,productRepository);
const productInputRepository = new ProductInputRepository(sqliteConnection);
const productOutputRepository = new ProductOutputRepository(sqliteConnection, productRepository);

const createProductUsecase = new CreateProductUsecase(productRepository);
const getProductUsecase = new GetProductUsecase(productRepository);
const createProductOrderUsecase = new CreateProductOrderUsecase(productOrderRepository,productRepository);
const createProductInputUseCase = new CreateProductInputUseCase(productInputRepository,productOrderRepository,productRepository);
const deleteProductInputUseCase = new DeleteProductInputUseCase(productInputRepository,productOrderRepository,productRepository);
const deleteProducOrderUseCase = new DeleteProductOrderUseCase(productOrderRepository, productInputRepository);
const deleteProductOutputUseCase = new DeleteProductOutputUseCase(productOutputRepository, productRepository);
const createProductOutputUsecase = new CreateProductOutputUsecase(productOutputRepository,productRepository);
const listProductsUsecase = new ListProductsUsecase(productRepository);
const listProductOrdersUsecase = new ListProductOrdersUsecase(productOrderRepository);


const createProductController = new CreateProductController(createProductUsecase);
const getProductController = new GetProductController(getProductUsecase);
const createProductOrderController = new CreateProductOrderController(createProductOrderUsecase);
const createProductInputController = new CreateProductInputController(createProductInputUseCase);
const createProductOutputController = new CreateProductOutputController(createProductOutputUsecase, productRepository);
const listProductsController = new ListProductsController(listProductsUsecase);
const deleteProductInputController = new DeleteProductInputController(deleteProductInputUseCase);
const deleteProductOutputController = new DeleteProductOutputController(deleteProductOutputUseCase);

const listProductOrderController = new ListProductOrderController(listProductOrdersUsecase);
const getProductOrderController = new GetProductOrderController(productOrderRepository);
const deleteProductOrderController = new DeleteProductOrderController(deleteProducOrderUseCase);

const app = fastify();

await app.register(cors, {
  origin: "*", // permite qualquer frontend
  methods: ["GET", "POST", "PUT", "DELETE"]
});

app.post("/products", createProductController.handle.bind(createProductController));
app.get("/products/:barcode",getProductController.handle.bind(getProductController));
app.get("/products",listProductsController.handle.bind(listProductsController));

app.post("/product-orders",createProductOrderController.handle.bind(createProductOrderController));
app.get("/product-orders", listProductOrderController.handle.bind(listProductOrderController));
app.get("/product-orders/:productOrderId", getProductOrderController.handle.bind(getProductOrderController));
app.delete("/product-orders/:productOrderId", deleteProductOrderController.handle.bind(deleteProductOrderController));

app.post("/product-inputs",createProductInputController.handle.bind(createProductInputController));
app.delete("/product-inputs/:productInputId",deleteProductInputController.handle.bind(deleteProductInputController));

app.post("/product-outputs",createProductOutputController.handle.bind(createProductOutputController));
app.delete("/product-outputs/:productOutputId",deleteProductOutputController.handle.bind(deleteProductOutputController));






app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
