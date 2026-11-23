import dns from "node:dns/promises";
import ipaddr from "ipaddr.js";

const blockedHosts = new Set(["localhost", "metadata.google.internal", "metadata.azure.internal"]);
const trackingParams = new Set(["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"]);

export function canonicalizeUrl(input: string, base?: string): string {
  const url = new URL(input, base);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Unsupported URL scheme");
  url.hash = "";
  url.hostname = url.hostname.toLowerCase();
  for (const key of [...url.searchParams.keys()]) if (trackingParams.has(key.toLowerCase())) url.searchParams.delete(key);
  url.searchParams.sort();
  if ((url.protocol === "http:" && url.port === "80") || (url.protocol === "https:" && url.port === "443")) url.port = "";
  if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/, "");
  return url.toString();
}

function isForbiddenAddress(address: string): boolean {
  const parsed = ipaddr.parse(address);
  const range = parsed.range();
  return range !== "unicast";
}

export async function assertPublicUrl(input: string): Promise<URL> {
  const url = new URL(canonicalizeUrl(input));
  if (blockedHosts.has(url.hostname) || url.hostname.endsWith(".local")) throw new Error("Private host is forbidden");
  if (ipaddr.isValid(url.hostname)) {
    if (isForbiddenAddress(url.hostname)) throw new Error("Private network address is forbidden");
    return url;
  }
  const records = await dns.lookup(url.hostname, { all: true, verbatim: true });
  if (!records.length || records.some((record) => isForbiddenAddress(record.address))) {
    throw new Error("Host resolves to a forbidden network address");
  }
  return url;
}

export function sameSite(a: string, b: string): boolean {
  const left = new URL(a).hostname.replace(/^www\./, "");
  const right = new URL(b).hostname.replace(/^www\./, "");
  return left === right;
}
