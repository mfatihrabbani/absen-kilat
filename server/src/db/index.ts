import { mkdirSync } from 'node:fs';
import path from 'node:path';

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

import { env } from '../env';
import * as schema from './schema';

// Pastikan folder database lokal ada (mis. `file:./data/absen-kilat.db`).
if (env.databaseUrl.startsWith('file:')) {
  mkdirSync(path.dirname(env.databaseUrl.slice('file:'.length)), { recursive: true });
}

export const client = createClient({ url: env.databaseUrl });

// Aktifkan foreign key (SQLite mematikannya secara bawaan).
await client.execute('PRAGMA foreign_keys = ON');

export const db = drizzle(client, { schema });
export { schema };
