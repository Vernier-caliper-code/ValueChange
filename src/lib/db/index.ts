import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

export type Database = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as {
  client?: postgres.Sql;
  db?: Database;
};

export function getDb(): Database {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL 未配置');
  }
  if (!globalForDb.db) {
    globalForDb.client = postgres(process.env.DATABASE_URL, {
      max: 3,
      prepare: false,
    });
    globalForDb.db = drizzle(globalForDb.client, { schema });
  }
  return globalForDb.db;
}

export { schema };

/** 是否已配置数据库。未配置时公开数据函数返回空结果（空状态），配置后查询异常才抛错。 */
export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
