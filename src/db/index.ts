import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { createMockDb } from "./mockDb";

const databaseUrl = process.env.DATABASE_URL;

// Check if databaseUrl is a plausible PostgreSQL connection URL
const isValidPostgresUrl = Boolean(
  databaseUrl &&
    (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://")) &&
    !databaseUrl.includes("vatx.bd") &&
    !databaseUrl.includes("example.com")
);

let dbInstance: any;
let poolInstance: Pool | null = null;

if (isValidPostgresUrl) {
  try {
    const globalForDb = globalThis as typeof globalThis & {
      __arenaNextJsPostgresqlPool?: Pool;
    };

    poolInstance =
      globalForDb.__arenaNextJsPostgresqlPool ??
      new Pool({
        connectionString: databaseUrl,
        connectionTimeoutMillis: 3000,
      });

    if (process.env.NODE_ENV !== "production") {
      globalForDb.__arenaNextJsPostgresqlPool = poolInstance;
    }

    dbInstance = drizzle(poolInstance);
  } catch (err) {
    console.warn("[BTCP] Failed to connect to PostgreSQL via DATABASE_URL, using in-memory mock database.", err);
    dbInstance = createMockDb();
  }
} else {
  // No valid PostgreSQL URL provided (e.g. dummy placeholder "vatx.bd") — use rich in-memory mock database
  dbInstance = createMockDb();
}

export const pool = poolInstance as Pool;
export const db: ReturnType<typeof drizzle> = dbInstance;

