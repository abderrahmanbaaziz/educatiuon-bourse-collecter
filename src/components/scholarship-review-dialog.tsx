"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Evidence = {
  id: string;
  field: string;
  value: unknown;
  sourceUrl: string;
  evidenceText: string;
  verificationStatus: string;
};

type ScholarshipDetail = {
  id: string;
  title: string;
  provider: string | null;
  institution: string | null;
  hostCountry: string | null;
  eligibleNationalities: string[];
  degreeLevels: string[];
  academicFields: string[];
  fundingCategory: string;
  tuitionCoverage: string | null;
  monthlyStipend: string | null;
  accommodation: string | null;
  travelAllowance: string | null;
  healthInsurance: string | null;
  languageRequirements: string | null;
  academicRequirements: string | null;
  ageRestrictions: string | null;
  opensAt: string | null;
  deadline: string | null;
  academicYear: string | null;
  requiredDocuments: string[];
  applicationProcess: string | null;
  applicationUrl: string | null;
  sourceUrl: string;
  status: string;
  evidence: Evidence[];
  source: {
    id: string;
    providerName: string;
    homepage: string;
    scholarshipUrl: string;
    trustLevel: "UNVERIFIED" | "TRUSTED" | "OFFICIAL";
  } | null;
  verification: { allowed: boolean; reasons: string[] };
};

type Props = {
  scholarshipId: string | null;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
};

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" });

function statusLabel(status: string) {
  const label = status.replaceAll("_", " ").toLowerCase();
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function safeUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function formatDate(value: string | null) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not recorded" : dateFormat.format(date);
}

function formatEvidenceValue(value: unknown) {
  if (value == null || value === "") return "Not recorded";
  if (Array.isArray(value)) return value.map(String).join(", ") || "Not recorded";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="review-detail"><dt>{label}</dt><dd>{children || "Not recorded"}</dd></div>;
}

export function ScholarshipReviewDialog({ scholarshipId, onClose, onStatusChange }: Props) {
  const [detail, setDetail] = useState<ScholarshipDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [reason, setReason] = useState("");
  const [trustSource, setTrustSource] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!scholarshipId) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key !== "Tab" || !panelRef.current) return;
      const controls = Array.from(panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled])"));
      if (!controls.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus();
    };
  }, [scholarshipId, close]);

  useEffect(() => {
    if (!scholarshipId) return;
    const controller = new AbortController();
    setLoading(true);
    setDetail(null);
    setLoadError("");
    setActionError("");
    setReason("");
    setTrustSource(false);
    fetch(`/api/scholarships/${scholarshipId}`, { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Scholarship details could not be loaded");
        return body as ScholarshipDetail;
      })
      .then(setDetail)
      .catch((error) => { if (error.name !== "AbortError") setLoadError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [scholarshipId, reload]);

  async function transition(status: "VERIFIED" | "REJECTED" | "NEEDS_REVIEW") {
    if (!detail || reason.trim().length < 5) {
      setActionError("Add a review note of at least five characters before changing the status.");
      return;
    }
    setSubmitting(status);
    setActionError("");
    try {
      const response = await fetch(`/api/scholarships/${detail.id}/status`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status, reason, trustSource: status === "VERIFIED" && trustSource }),
      });
      const result = await response.json();
      if (!response.ok) {
        const reasons = Array.isArray(result.reasons) ? result.reasons.map((item: string) => statusLabel(item)).join("; ") : "";
        throw new Error([result.error, reasons].filter(Boolean).join(": "));
      }
      setDetail((current) => current ? {
        ...current,
        status: result.status,
        source: current.source && trustSource ? { ...current.source, trustLevel: "TRUSTED" } : current.source,
      } : current);
      setReason("");
      setTrustSource(false);
      onStatusChange(detail.id, result.status);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "The status could not be updated. Please try again.");
    } finally {
      setSubmitting(null);
    }
  }

  if (!scholarshipId) return null;

  const applicationUrl = safeUrl(detail?.applicationUrl);
  const sourceUrl = safeUrl(detail?.sourceUrl);
  const sourceNeedsTrust = detail?.source?.trustLevel === "UNVERIFIED";

  return <div className="review-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <section className="review-dialog" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="review-title" aria-describedby="review-summary">
      <header className="review-header">
        <div>
          <p id="review-summary">Scholarship evidence review</p>
          <h2 id="review-title">{detail?.title ?? "Loading scholarship"}</h2>
        </div>
        <button ref={closeRef} className="review-close" type="button" onClick={close}>Close</button>
      </header>

      {loading && <div className="review-state" role="status">Loading application details and evidence…</div>}
      {loadError && <div className="review-state review-state-error" role="alert"><p>{loadError}</p><button className="button button-secondary" type="button" onClick={() => setReload((value) => value + 1)}>Try again</button></div>}

      {detail && <>
        <div className="review-link-bar">
          {applicationUrl && <a className="button" href={applicationUrl} target="_blank" rel="noreferrer">Open application page</a>}
          {sourceUrl && <a className="button button-secondary" href={sourceUrl} target="_blank" rel="noreferrer">Open scholarship source</a>}
          {!applicationUrl && <span className="review-link-note">A separate application link was not extracted. Use the scholarship source while reviewing registration instructions.</span>}
        </div>

        <div className="review-scroll">
          <section className="review-section">
            <div className="review-section-heading"><h3>Opportunity summary</h3><span className={`badge ${detail.status === "VERIFIED" ? "good" : "warn"}`}>{statusLabel(detail.status)}</span></div>
            <dl className="review-detail-grid">
              <Detail label="Provider">{detail.provider ?? detail.institution}</Detail>
              <Detail label="Country">{detail.hostCountry}</Detail>
              <Detail label="Funding">{statusLabel(detail.fundingCategory)}</Detail>
              <Detail label="Deadline">{formatDate(detail.deadline)}</Detail>
              <Detail label="Degree levels">{detail.degreeLevels.join(", ")}</Detail>
              <Detail label="Academic year">{detail.academicYear}</Detail>
              <Detail label="Eligible nationalities">{detail.eligibleNationalities.join(", ")}</Detail>
              <Detail label="Fields of study">{detail.academicFields.join(", ")}</Detail>
            </dl>
          </section>

          <section className="review-section">
            <h3>How to apply</h3>
            <p className="review-long-copy">{detail.applicationProcess ?? "Application steps were not extracted from the source. Open the scholarship source and confirm the current instructions before verification."}</p>
            <h4>Required documents</h4>
            {detail.requiredDocuments.length ? <ul className="review-list">{detail.requiredDocuments.map((document) => <li key={document}>{document}</li>)}</ul> : <p className="review-missing">No required-document list was extracted.</p>}
          </section>

          <section className="review-section">
            <h3>Eligibility and funding details</h3>
            <dl className="review-detail-grid">
              <Detail label="Academic requirements">{detail.academicRequirements}</Detail>
              <Detail label="Language requirements">{detail.languageRequirements}</Detail>
              <Detail label="Age restrictions">{detail.ageRestrictions}</Detail>
              <Detail label="Tuition coverage">{detail.tuitionCoverage}</Detail>
              <Detail label="Monthly stipend">{detail.monthlyStipend}</Detail>
              <Detail label="Accommodation">{detail.accommodation}</Detail>
              <Detail label="Travel allowance">{detail.travelAllowance}</Detail>
              <Detail label="Health insurance">{detail.healthInsurance}</Detail>
            </dl>
          </section>

          <section className="review-section">
            <div className="review-section-heading"><h3>Source evidence</h3><span className={`badge ${detail.source?.trustLevel === "OFFICIAL" || detail.source?.trustLevel === "TRUSTED" ? "good" : "warn"}`}>{detail.source ? statusLabel(detail.source.trustLevel) : "No registered source"}</span></div>
            {detail.evidence.length ? <div className="evidence-list">{detail.evidence.map((evidence) => <article className="evidence-item" key={evidence.id}>
              <div><strong>{statusLabel(evidence.field)}</strong><span>{formatEvidenceValue(evidence.value)}</span></div>
              <p>{evidence.evidenceText}</p>
              {safeUrl(evidence.sourceUrl) && <a href={evidence.sourceUrl} target="_blank" rel="noreferrer">View supporting page</a>}
            </article>)}</div> : <p className="review-missing">No field-level evidence was saved for this record.</p>}
          </section>
        </div>

        <footer className="review-decision">
          {detail.status === "NEEDS_REVIEW" && <>
            <div className="verification-readiness">
              <strong>{detail.verification.allowed ? "Ready for verification" : "Review requirements"}</strong>
              {detail.verification.reasons.length ? <ul>{detail.verification.reasons.map((item) => <li key={item}>{statusLabel(item)}</li>)}</ul> : <p>Identity, critical details, application link, and source trust checks passed.</p>}
            </div>
            {sourceNeedsTrust && <label className="trust-source"><input type="checkbox" checked={trustSource} onChange={(event) => setTrustSource(event.target.checked)} /><span><strong>Mark this source as trusted</strong><small>I reviewed the linked source and confirm it is suitable for future verification decisions.</small></span></label>}
          </>}
          <label htmlFor="review-reason">Review note<textarea id="review-reason" rows={3} maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Record what you checked and why this decision is appropriate." /></label>
          {actionError && <p className="review-action-error" role="alert">{actionError}</p>}
          <div className="review-actions">
            {detail.status === "NEEDS_REVIEW" && <>
              <button className="button" type="button" disabled={Boolean(submitting)} onClick={() => void transition("VERIFIED")}>{submitting === "VERIFIED" ? "Verifying…" : "Verify scholarship"}</button>
              <button className="button button-danger" type="button" disabled={Boolean(submitting)} onClick={() => void transition("REJECTED")}>{submitting === "REJECTED" ? "Rejecting…" : "Reject record"}</button>
            </>}
            {detail.status === "VERIFIED" && <button className="button button-secondary" type="button" disabled={Boolean(submitting)} onClick={() => void transition("NEEDS_REVIEW")}>{submitting ? "Reopening…" : "Reopen review"}</button>}
            <button className="button button-secondary" type="button" onClick={close}>Done</button>
          </div>
        </footer>
      </>}
    </section>
  </div>;
}
