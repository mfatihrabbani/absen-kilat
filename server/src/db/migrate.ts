import { migrate } from 'drizzle-orm/libsql/migrator';

import { client, db } from './index';

/** Terapkan semua migrasi di folder `drizzle/` ke database. */
await migrate(db, { migrationsFolder: './drizzle' });
console.log('Migrasi database selesai.');
client.close();
