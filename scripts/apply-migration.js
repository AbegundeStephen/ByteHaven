const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const sqlPath = process.argv[2];
const sql = fs.readFileSync(sqlPath, "utf8");

const client = new Client({
  connectionString: process.env.DATABASE_URL_RAW,
  ssl: { rejectUnauthorized: false },
});

client
  .connect()
  .then(async () => {
    console.log("Connected. Applying:", path.basename(sqlPath));
    await client.query(sql);
    console.log("Applied OK.");
    await client.end();
  })
  .catch((e) => {
    console.error("FAILED:", e.message);
    process.exit(1);
  });
