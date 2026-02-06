import { SqliteConnection } from "./repositories/SqliteConnection";
import { ProductRepository } from "./repositories/ProductRepository";
import { CreateProductUsecase } from "./usecases/CreateProductUsecase";
import { CreateProductController } from "./controllers/CreateProductController";
import fastify from "fastify";

const sqliteConnection = new SqliteConnection("db/estoque.db");
const productRepository = new ProductRepository(sqliteConnection);
const createProductUsecase = new CreateProductUsecase(productRepository);
const createProductController = new CreateProductController(createProductUsecase);

const app = fastify();

app.post("/products", createProductController.handle.bind(createProductController));

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});