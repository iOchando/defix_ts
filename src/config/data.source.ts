import "dotenv/config";
import path from "path";
import { DataSource } from "typeorm";

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.HOST_ORM,
  port: Number(process.env.PORT_DB),
  username: process.env.USER_ORM,
  password: process.env.PASSWORD_ORM,
  database: process.env.DATABASE_ORM,
  synchronize: false,
  logging: true,
  entities: [path.join(__dirname, "../entities/*")],
  subscribers: [],
  migrations: [path.join(__dirname, "../migrations/*")],
});

export default AppDataSource;
