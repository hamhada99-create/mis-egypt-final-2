import { Pool } from "pg";

declare global { var __misPool: Pool | undefined; }

export function getPool() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  if (!global.__misPool) global.__misPool = new Pool({ connectionString: process.env.DATABASE_URL });
  return global.__misPool;
}

export async function dbQuery<T=any>(text:string, params:any[]=[]):Promise<T[]> {
  const pool=getPool(); const result=await pool.query(text,params); return result.rows as T[];
}
