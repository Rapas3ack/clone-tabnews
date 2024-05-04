import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";
export default async function migrations(request, response) {
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(request.method)) {
    return response.status(405).json({
      error: `Method ${request.method} Not Allowed`,
    }); // Method Not Allowed
  }

  let dbClient;
  try {
    dbClient = await database.getNewClient();

    const defaultMigrationOptions = {
      dbClient,
      databaseUrl: process.env.DATABASE_URL,
      dryRun: true,
      dir: join("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    };

    if (request.method === "GET") {
      const pendingMigrations = await migrationRunner(defaultMigrationOptions);
      return response.status(200).json(pendingMigrations); // 200 OK
    }

    if (request.method === "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationOptions,
        dryRun: false,
      });

      if (migratedMigrations.length > 0) {
        return response.status(201).json(migratedMigrations); // 201 Created
      }

      return response.status(200).json(migratedMigrations); // 200 OK
    }
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      error: "Internal Server Error",
    }); // 500 Internal Server Error
  } finally {
    await dbClient.end();
  }
}
