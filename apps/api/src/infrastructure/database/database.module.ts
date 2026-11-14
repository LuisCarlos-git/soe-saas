import { Global, Module, type DynamicModule } from "@nestjs/common";
import { createDatabase } from "./database.factory";
export const DATABASE = Symbol("DATABASE");
@Global()
@Module({})
export class DatabaseModule {
  static forRoot(url: string): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: DATABASE,
          useFactory: () => {
            const database = createDatabase(url);
            return Object.assign(database, {
              onModuleDestroy: () => database.$disconnect(),
            });
          },
        },
      ],
      exports: [DATABASE],
    };
  }
}
