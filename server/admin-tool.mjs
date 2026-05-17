import "dotenv/config";
import bcrypt from "bcryptjs";
import { copyFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(rootDir, "data");
const dbFile = path.join(dataDir, "linkflow.json");
const adminEmails = new Set(
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);

function usage() {
  console.log(`
Usage:
  node server/admin-tool.mjs list
  node server/admin-tool.mjs inspect <email>
  node server/admin-tool.mjs verify-email <email>
  node server/admin-tool.mjs reset-password <email> <new-password>

Reads DATA_DIR from env. Current database:
  ${dbFile}
`);
}

async function readState() {
  return JSON.parse(await readFile(dbFile, "utf8"));
}

async function writeState(state) {
  await mkdir(dataDir, { recursive: true });
  const backup = `${dbFile}.${new Date().toISOString().replace(/[:.]/g, "-")}.bak`;
  await copyFile(dbFile, backup);
  const tmp = `${dbFile}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(state, null, 2));
  await rename(tmp, dbFile);
  console.log(`Backup written: ${backup}`);
}

function findUser(state, email) {
  const normalizedEmail = String(email ?? "").trim().toLowerCase();
  return state.users?.find((user) => String(user.email).toLowerCase() === normalizedEmail) ?? null;
}

function isEmailVerified(user) {
  return Boolean(user.emailVerifiedAt) || !Object.prototype.hasOwnProperty.call(user, "emailVerifiedAt");
}

function verificationTokensFor(state, userId) {
  return Object.values(state.emailVerificationTokens ?? {}).filter((record) => record.userId === userId);
}

function printUser(state, user) {
  const tokens = verificationTokensFor(state, user.id);
  console.log(JSON.stringify({
    id: user.id,
    email: user.email,
    username: user.username,
    createdAt: user.createdAt ?? null,
    emailVerifiedAt: user.emailVerifiedAt ?? null,
    isEmailVerified: isEmailVerified(user),
    isAdminByEnv: adminEmails.has(String(user.email).toLowerCase()),
    authProviders: Object.keys(user.oauthProviders ?? {}).length ? Object.keys(user.oauthProviders) : ["password"],
    pendingVerificationTokens: tokens.length,
  }, null, 2));
}

const [command, email, password] = process.argv.slice(2);

try {
  if (!command || command === "help" || command === "--help" || command === "-h") {
    usage();
    process.exit(0);
  }

  const state = await readState();

  if (command === "list") {
    const users = (state.users ?? []).map((user) => ({
      email: user.email,
      username: user.username,
      createdAt: user.createdAt ?? null,
      isEmailVerified: isEmailVerified(user),
      isAdminByEnv: adminEmails.has(String(user.email).toLowerCase()),
    }));
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
  }

  if (!email) {
    usage();
    process.exit(1);
  }

  const user = findUser(state, email);
  if (!user) {
    console.error(`User not found in ${dbFile}: ${email}`);
    console.error("If this account existed before, check that DATA_DIR still points to /var/www/linkflow/shared/data.");
    process.exit(2);
  }

  if (command === "inspect") {
    printUser(state, user);
    process.exit(0);
  }

  if (command === "verify-email") {
    user.emailVerifiedAt = user.emailVerifiedAt ?? new Date().toISOString();
    for (const [token, record] of Object.entries(state.emailVerificationTokens ?? {})) {
      if (record.userId === user.id) delete state.emailVerificationTokens[token];
    }
    await writeState(state);
    printUser(state, user);
    process.exit(0);
  }

  if (command === "reset-password") {
    if (!password || password.length < 8) {
      console.error("New password must be at least 8 characters.");
      process.exit(1);
    }
    user.passwordHash = await bcrypt.hash(password, 12);
    user.emailVerifiedAt = user.emailVerifiedAt ?? new Date().toISOString();
    for (const [token, record] of Object.entries(state.emailVerificationTokens ?? {})) {
      if (record.userId === user.id) delete state.emailVerificationTokens[token];
    }
    await writeState(state);
    console.log(`Password reset for ${user.email}. Email is verified.`);
    printUser(state, user);
    process.exit(0);
  }

  usage();
  process.exit(1);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
