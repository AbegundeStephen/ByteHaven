const fs = require("fs");
const crypto = require("crypto");
const path = require("path");
const { Client } = require("pg");

const migrationDir = process.argv[2]; // e.g. prisma/migrations/20260830000000_init
const migrationName = path.basename(migrationDir);
const sql = fs.readFileSync(path.join(migrationDir, "migration.sql"), "utf8");
const checksum = crypto.createHash("sha256").update(sql).digest("hex");
const id = crypto.randomUUID();

const client = new Client({
  connectionString: process.env.DATABASE_URL_RAW,
  ssl: { rejectUnauthorized: false },
});

client
  .connect()
  .then(async () => {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        "id" VARCHAR(36) NOT NULL,
        "checksum" VARCHAR(64) NOT NULL,
        "finished_at" TIMESTAMPTZ,
        "migration_name" VARCHAR(255) NOT NULL,
        "logs" TEXT,
        "rolled_back_at" TIMESTAMPTZ,
        "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
        CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
      );
    `);
    await client.query(
      `INSERT INTO "_prisma_migrations"
        ("id", "checksum", "finished_at", "migration_name", "applied_steps_count")
       VALUES ($1, $2, now(), $3, 1)`,
      [id, checksum, migrationName],
    );
    console.log("Recorded migration:", migrationName, "checksum:", checksum);
    await client.end();
  })
  .catch((e) => {
    console.error("FAILED:", e.message);
    process.exit(1);
  });
