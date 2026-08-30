import bcrypt from "bcryptjs";
import { db } from "../lib/db";
import { checkPasswordStrength } from "../lib/password";

/** Bootstraps the first admin account from ADMIN_EMAIL/ADMIN_PASSWORD env
 * vars. There is no public admin sign-up — this is the only way an
 * AdminUser row gets created. Safe to re-run: upserts by email. */
async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Admin";

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  }

  const strength = checkPasswordStrength(password);
  if (!strength.valid) {
    throw new Error(`ADMIN_PASSWORD is too weak: ${strength.reason}`);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await db.adminUser.upsert({
    where: { email: email.toLowerCase() },
    update: { passwordHash, name },
    create: { email: email.toLowerCase(), passwordHash, name },
  });

  console.log(`Admin account ready: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
