import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle> | null = null;

export function db() {
  if (_db) return _db;
  if (!env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Persistence disabled — set it in .env.local before using db()."
    );
  }
  const client = postgres(env.DATABASE_URL, { prepare: false });
  _db = drizzle(client, { schema });
  return _db;
}

export { schema };
