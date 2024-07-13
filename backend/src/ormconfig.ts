import { DataSource, DataSourceOptions } from "typeorm";

export const typeOrmMySQLConfig: DataSourceOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'rootpass',
  database: 'nurse-db',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false,
  migrations: [__dirname + '/**/db/migrations/*{.ts,.js}'],
}

export default new DataSource(typeOrmMySQLConfig);