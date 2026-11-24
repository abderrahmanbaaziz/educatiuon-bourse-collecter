import { SearchIntelligence } from "@/components/search-intelligence";

export default function Page() {
  return <>
    <header className="heading">
      <div>
        <span className="eyebrow">Search intelligence</span>
        <h1>Query performance</h1>
        <p>See what each paid search returned, which websites entered the crawler, and whether strict scholarship candidates survived validation.</p>
      </div>
    </header>
    <SearchIntelligence />
  </>;
}
