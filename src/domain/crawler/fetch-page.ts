import robotsParser from "robots-parser";
import { config } from "@/lib/config";
import { assertPublicUrl, canonicalizeUrl } from "./url-policy";

const USER_AGENT = "BourseCollector/0.1 (+scholarship-research; respects robots.txt)";

async function robotsAllows(url: URL, signal: AbortSignal): Promise<boolean> {
  const robotsUrl = `${url.protocol}//${url.host}/robots.txt`;
  try {
    const response = await fetch(robotsUrl, { headers: { "user-agent": USER_AGENT }, signal, redirect: "error" });
    if (!response.ok) return true;
    return robotsParser(robotsUrl, await response.text()).isAllowed(url.toString(), USER_AGENT) !== false;
  } catch { return true; }
}

export async function fetchPublicPage(input: string) {
  let url = await assertPublicUrl(input);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.CRAWLER_REQUEST_TIMEOUT_MS);
  try {
    if (!(await robotsAllows(url, controller.signal))) throw new Error("Blocked by robots.txt");
    for (let redirects = 0; redirects <= 5; redirects++) {
      const response = await fetch(url, {
        headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml,application/pdf;q=0.9" },
        signal: controller.signal,
        redirect: "manual",
      });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) throw new Error("Redirect missing destination");
        url = await assertPublicUrl(canonicalizeUrl(location, url.toString()));
        continue;
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const length = Number(response.headers.get("content-length") ?? 0);
      if (length > config.CRAWLER_MAX_CONTENT_BYTES) throw new Error("Response exceeds content limit");
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes.byteLength > config.CRAWLER_MAX_CONTENT_BYTES) throw new Error("Response exceeds content limit");
      return { url: url.toString(), status: response.status, contentType: response.headers.get("content-type") ?? "", bytes };
    }
    throw new Error("Too many redirects");
  } finally { clearTimeout(timeout); }
}
