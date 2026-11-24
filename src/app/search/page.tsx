import { SearchIntelligence } from "@/components/search-intelligence";

export default function Page() {
  return <>
    <header className="heading">
      <div>
        <span className="eyebrow">Paid search audit</span>
        <h1>Search queries</h1>
        <p>See what each paid search returned, which websites entered the crawler, and whether strict scholarship candidates survived validation.</p>
      </div>
    </header>
    <SearchIntelligence />
  </>;
}
