import crypto from "crypto";

export function createSignedQuery(path: string, ttlSeconds = Number(process.env.SIGNED_URL_TTL || 600)) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${path}.${exp}`;
  const sig = crypto.createHmac("sha256", process.env.SIGNED_URL_SECRET as string).update(payload).digest("hex");
  return { exp, sig };
}

export function verifySignedQuery(path: string, sig: string, exp: string) {
  const payload = `${path}.${exp}`;
  const expected = crypto.createHmac("sha256", process.env.SIGNED_URL_SECRET as string).update(payload).digest("hex");
  const now = Math.floor(Date.now() / 1000);
  return expected === sig && now <= Number(exp);
}
