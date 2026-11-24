export type DorkSource = { id: string; providerName: string; scholarshipUrl: string; priority: number; languages: string[] };
export type DomainDork = { sourceId: string; providerName: string; domain: string; query: string; language: string; priority: number };

function normalizedDomain(url: string) { return new URL(url).hostname.toLowerCase().replace(/^www\./, ""); }

function queryFor(domain: string, language: string, year: number, variant: number) {
  if (language === "fr") return variant % 2 === 0
    ? `site:${domain} (bourse OR financement) (master OR doctorat) (Algérie OR algérien) ${year}`
    : `site:${domain} ("appel à candidatures" OR bourse) (Algérie OR algérien) ${year}`;
  if (language === "ar") return variant % 2 === 0
    ? `site:${domain} (منحة OR بعثة) (ماستر OR دكتوراه) (الجزائر OR للجزائريين) ${year}`
    : `site:${domain} (منحة OR تمويل) (الجزائر OR للجزائريين) "التسجيل" ${year}`;
  return variant % 2 === 0
    ? `site:${domain} (scholarship OR fellowship OR grant) (master OR phd) (Algeria OR Algerian) ${year}`
    : `site:${domain} ("applications open" OR scholarship) (Algeria OR Algerian) ${year}`;
}

function preferredLanguage(source: DorkSource) {
  return source.languages.find((value) => ["en", "fr", "ar"].includes(value.toLowerCase()))?.toLowerCase() ?? "en";
}

export function generateDomainDorks(sources: DorkSource[], year = new Date().getUTCFullYear() + 1): DomainDork[] {
  const representatives = new Map<string, DorkSource>();
  for (const source of sources) {
    const domain = normalizedDomain(source.scholarshipUrl);
    const current = representatives.get(domain);
    if (!current || source.priority > current.priority) representatives.set(domain, source);
  }
  return [...representatives.entries()]
    .sort((left, right) => right[1].priority - left[1].priority || left[0].localeCompare(right[0]))
    .map(([domain, source], index) => {
      const language = preferredLanguage(source);
      return { sourceId: source.id, providerName: source.providerName, domain, query: queryFor(domain, language, year, index), language, priority: source.priority };
    });
}

const degreePattern = /\b(ph\.?d\.?|doctorate|doctoral|master(?:'s)?|msc|mba|bachelor(?:'s)?|undergraduate)\b/i;

export function buildTargetedDorks(request: string, year = new Date().getUTCFullYear() + 1) {
  const cleaned = request.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
  if (cleaned.length < 3) throw new Error("Add a study field, for example: /discover computer science master");
  const degree = cleaned.match(degreePattern)?.[0] ?? "master OR phd";
  return [
    `"${cleaned}" scholarship (Algeria OR Algerian) ${year} application`,
    `"${cleaned}" "fully funded" scholarship (Algeria OR Algerian) ${year}`,
    `"${cleaned}" (${degree}) (scholarship OR fellowship) (Algeria OR Algerian) deadline ${year}`,
  ];
}

export function buildAlgeriaDiscoveryDorks(year = new Date().getUTCFullYear() + 1) {
  return [
    `(Algeria OR Algerian) (scholarship OR fellowship) (master OR phd) "applications open" ${year}`,
    `("eligible countries" Algeria) "fully funded" scholarship apply ${year}`,
    `(Algérie OR algérien) (bourse OR financement) (master OR doctorat) candidature ${year}`,
    `(الجزائر OR للطلبة الجزائريين) (منحة OR تمويل) (ماستر OR دكتوراه) التقديم ${year}`,
    `site:edu (Algeria OR Algerian) scholarship application ${year}`,
    `site:ac.uk (Algeria OR Algerian) international scholarship apply ${year}`,
  ];
}

export function rotateDorks<T>(items: T[], cursor: number, limit: number) {
  if (!items.length || limit <= 0) return { selected: [] as T[], nextCursor: 0 };
  const selected = Array.from({ length: Math.min(limit, items.length) }, (_, offset) => items[(cursor + offset) % items.length]);
  return { selected, nextCursor: (cursor + selected.length) % items.length };
}
