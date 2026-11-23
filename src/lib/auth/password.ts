import { scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
const DEFAULT_COST = 32_768;
const DEFAULT_BLOCK_SIZE = 8;
const DEFAULT_PARALLELIZATION = 1;
const KEY_LENGTH = 64;

type ParsedHash = {
  cost: number;
  blockSize: number;
  parallelization: number;
  salt: Buffer;
  digest: Buffer;
};

function parsePasswordHash(encoded: string): ParsedHash {
  const [algorithm, costRaw, blockSizeRaw, parallelizationRaw, saltRaw, digestRaw, extra] = encoded.split("$");
  const cost = Number(costRaw);
  const blockSize = Number(blockSizeRaw);
  const parallelization = Number(parallelizationRaw);
  const salt = Buffer.from(saltRaw ?? "", "base64url");
  const digest = Buffer.from(digestRaw ?? "", "base64url");

  if (
    algorithm !== "scrypt" || extra !== undefined || !Number.isInteger(cost) ||
    cost < 16_384 || cost > 1_048_576 || (cost & (cost - 1)) !== 0 ||
    !Number.isInteger(blockSize) || blockSize < 1 || blockSize > 32 ||
    !Number.isInteger(parallelization) || parallelization < 1 || parallelization > 16 ||
    salt.length < 16 || digest.length !== KEY_LENGTH
  ) {
    throw new Error("ADMIN_PASSWORD_HASH is not a supported scrypt hash");
  }

  return { cost, blockSize, parallelization, salt, digest };
}

async function derive(password: string, parsed: ParsedHash) {
  const maxmem = Math.max(64 * 1024 * 1024, 256 * parsed.cost * parsed.blockSize);
  return new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, parsed.salt, parsed.digest.length, {
      N: parsed.cost,
      r: parsed.blockSize,
      p: parsed.parallelization,
      maxmem,
    }, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(Buffer.from(derivedKey));
    });
  });
}

export async function verifyPassword(password: string, encodedHash: string): Promise<boolean> {
  const parsed = parsePasswordHash(encodedHash);
  const candidate = await derive(password, parsed);
  return timingSafeEqual(candidate, parsed.digest);
}

export async function hashPassword(password: string, salt: Buffer): Promise<string> {
  if (password.length < 12) throw new Error("Password must contain at least 12 characters");
  if (salt.length < 16) throw new Error("Salt must contain at least 16 bytes");
  const parsed = {
    cost: DEFAULT_COST,
    blockSize: DEFAULT_BLOCK_SIZE,
    parallelization: DEFAULT_PARALLELIZATION,
    salt,
    digest: Buffer.alloc(KEY_LENGTH),
  };
  const digest = await derive(password, parsed);
  return `scrypt$${parsed.cost}$${parsed.blockSize}$${parsed.parallelization}$${salt.toString("base64url")}$${digest.toString("base64url")}`;
}
