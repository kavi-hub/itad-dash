import { useEffect, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import { inspectWorkbook, type SheetInspection } from "./lib/inspectWorkbook";
import { buildStoragePath, sha256Hex, validateWorkbook } from "./lib/upload";

type Membership = {
  organisation_id: string;
  role: "operator" | "manager" | "client_viewer";
  organisations: { display_name: string } | null;
};

type StoredUpload = {
  id: string;
  original_filename: string;
  storage_path: string;
  byte_size: number;
  sha256: string;
  created_at: string;
};

type InspectionRecord = {
  id: string;
  source_upload_id: string;
  sheets: SheetInspection[];
  warnings: string[];
  created_at: string;
};

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  if (loading) return <main className="center"><p>Checking secure access…</p></main>;
  if (!user) return <SignIn />;
  return <Workspace user={user} />;
}

export function SignIn() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function requestAccess(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    const normalizedEmail = email.trim().toLowerCase();
    setBusy(true);
    setStatus("Sending your secure sign-in options…");
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: window.location.origin,
        shouldCreateUser: false,
      },
    });
    setBusy(false);
    if (error) return setStatus(error.message);
    setEmail(normalizedEmail);
    setSentTo(normalizedEmail);
    setStatus("Check your email. Use the secure link or enter the six-digit code below.");
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();
    if (!sentTo || busy || !/^\d{6}$/.test(code)) return;
    setBusy(true);
    setStatus("Checking your one-time code…");
    const { error } = await supabase.auth.verifyOtp({
      email: sentTo,
      token: code,
      type: "email",
    });
    setBusy(false);
    if (error) setStatus(error.message);
  }

  return <main className="center">
    <section className="panel auth-panel">
      <span className="eyebrow">Bulk GSM operations</span>
      <h1>ITAD Dash</h1>
      <p className="muted">Secure evidence in. Clear outcomes out.</p>
      {!sentTo ? <form onSubmit={requestAccess}>
        <label htmlFor="email">Work email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" disabled={busy} />
        <button type="submit" disabled={busy}>{busy ? "Sending…" : "Email my sign-in options"}</button>
      </form> : <>
        <form onSubmit={verifyCode}>
          <label htmlFor="code">Six-digit email code</label>
          <input id="code" className="code-input" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} required disabled={busy} />
          <button type="submit" disabled={busy || code.length !== 6}>{busy ? "Checking…" : "Sign in with code"}</button>
        </form>
        <button className="text-button" type="button" onClick={() => { setSentTo(null); setCode(""); setStatus(null); }}>Use a different email</button>
      </>}
      {status && <p role="status" className="status">{status}</p>}
    </section>
  </main>;
}

function Workspace({ user }: { user: User }) {
  const [membership, setMembership] = useState<Membership | null>(null);
  const [membershipError, setMembershipError] = useState<string | null>(null);
  const [evidenceRevision, setEvidenceRevision] = useState(0);

  useEffect(() => {
    void supabase.from("organisation_memberships")
      .select("organisation_id, role, organisations(display_name)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) setMembershipError(error.message);
        else if (!data) setMembershipError("Your account has no active ITAD Dash organisation.");
        else setMembership(data as unknown as Membership);
      });
  }, [user.id]);

  return <main className="app-shell">
    <header>
      <div><span className="eyebrow">ITAD Dash</span><strong>{membership?.organisations?.display_name ?? "Secure workspace"}</strong></div>
      <button className="quiet" onClick={() => void supabase.auth.signOut()}>Sign out</button>
    </header>
    <section className="hero">
      <div><span className="eyebrow">Slices A + B</span><h1>Secure source inspection</h1><p>Store a workbook, then inspect its sheets and headers without importing operational rows.</p></div>
      <div className="trust"><strong>Private by design</strong><span>Organisation-scoped storage</span><span>Immutable source record</span><span>Structure only, no row import</span></div>
    </section>
    {membershipError ? <section className="panel warning" role="alert">{membershipError}</section> : membership ? <>
      <UploadCard user={user} membership={membership} onStored={() => setEvidenceRevision((value) => value + 1)} />
      <EvidenceList user={user} membership={membership} revision={evidenceRevision} />
    </> : <p>Loading organisation access…</p>}
  </main>;
}

function UploadCard({ user, membership, onStored }: { user: User; membership: Membership; onStored: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const canUpload = membership.role === "operator" || membership.role === "manager";

  async function upload() {
    if (!file || !canUpload || uploading) return;
    const validation = validateWorkbook(file);
    if (!validation.ok) return setStatus(validation.message);
    setUploading(true);
    try {
      setStatus("Calculating source checksum…");
      const checksum = await sha256Hex(file);
      const { data: existing, error: lookupError } = await supabase
        .from("source_uploads")
        .select("id, status")
        .eq("organisation_id", membership.organisation_id)
        .eq("sha256", checksum)
        .maybeSingle();
      if (lookupError) return setStatus(lookupError.message);
      if (existing) return setStatus("This exact workbook is already stored for your organisation.");

      const uploadId = crypto.randomUUID();
      const path = buildStoragePath(membership.organisation_id, uploadId, file.name);
      setStatus("Uploading to private evidence storage…");
      const { error: storageError } = await supabase.storage.from("itad-source-files").upload(path, file, { contentType: file.type || undefined, upsert: false });
      if (storageError) return setStatus(storageError.message);
      const { error: recordError } = await supabase.from("source_uploads").insert({
        id: uploadId,
        organisation_id: membership.organisation_id,
        uploaded_by: user.id,
        original_filename: file.name,
        storage_path: path,
        byte_size: file.size,
        mime_type: file.type || null,
        sha256: checksum,
        status: "stored",
      });
      if (recordError) return setStatus(`File stored; upload record ${uploadId} needs reconciliation: ${recordError.message}`);
      setStatus("Workbook stored securely and ready for schema inspection.");
      setFile(null);
      onStored();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "The secure upload could not be completed.");
    } finally {
      setUploading(false);
    }
  }

  return <section className="panel upload-card">
    <div><span className="eyebrow">Source evidence</span><h2>Select a synthetic workbook</h2><p className="muted">Accepted: .xlsx, up to 20 MB. Live client workbooks remain outside development.</p></div>
    <label className="drop-zone">
      <span>{file?.name ?? "Choose workbook"}</span>
      <input type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(e) => setFile(e.target.files?.[0] ?? null)} disabled={!canUpload || uploading} />
    </label>
    {!canUpload && <p role="alert" className="warning">Your role can view evidence but cannot upload it.</p>}
    <button onClick={() => void upload()} disabled={!file || !canUpload || uploading}>{uploading ? "Storing workbook…" : "Store workbook securely"}</button>
    {status && <p role="status" className="status">{status}</p>}
  </section>;
}

function EvidenceList({ user, membership, revision }: { user: User; membership: Membership; revision: number }) {
  const [uploads, setUploads] = useState<StoredUpload[]>([]);
  const [inspections, setInspections] = useState<Record<string, InspectionRecord>>({});
  const [status, setStatus] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const canInspect = membership.role === "operator" || membership.role === "manager";

  useEffect(() => {
    let active = true;
    void Promise.all([
      supabase.from("source_uploads")
        .select("id, original_filename, storage_path, byte_size, sha256, created_at")
        .eq("organisation_id", membership.organisation_id)
        .order("created_at", { ascending: false }),
      supabase.from("workbook_inspections")
        .select("id, source_upload_id, sheets, warnings, created_at")
        .eq("organisation_id", membership.organisation_id),
    ]).then(([uploadResult, inspectionResult]) => {
      if (!active) return;
      if (uploadResult.error) return setStatus(uploadResult.error.message);
      if (inspectionResult.error) return setStatus(inspectionResult.error.message);
      setUploads((uploadResult.data ?? []) as StoredUpload[]);
      setInspections(Object.fromEntries(((inspectionResult.data ?? []) as unknown as InspectionRecord[])
        .map((inspection) => [inspection.source_upload_id, inspection])));
    });
    return () => { active = false; };
  }, [membership.organisation_id, revision]);

  async function inspect(upload: StoredUpload) {
    if (!canInspect || busyId) return;
    setBusyId(upload.id);
    setStatus("Downloading the private source for local structural inspection…");
    try {
      const { data: source, error: downloadError } = await supabase.storage
        .from("itad-source-files")
        .download(upload.storage_path);
      if (downloadError) return setStatus(downloadError.message);
      const result = inspectWorkbook(await source.arrayBuffer());
      const { data, error } = await supabase.from("workbook_inspections").insert({
        source_upload_id: upload.id,
        organisation_id: membership.organisation_id,
        inspected_by: user.id,
        inspector_version: "slice-b-v1",
        sheets: result.sheets,
        warnings: result.warnings,
      }).select("id, source_upload_id, sheets, warnings, created_at").single();
      if (error) return setStatus(error.message);
      const inspection = data as unknown as InspectionRecord;
      setInspections((current) => ({ ...current, [upload.id]: inspection }));
      setStatus("Workbook structure recorded. No operational rows were imported.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "The workbook could not be inspected safely.");
    } finally {
      setBusyId(null);
    }
  }

  return <section className="panel evidence-list">
    <div className="section-heading">
      <div><span className="eyebrow">Structural inspection</span><h2>Stored source evidence</h2></div>
      <span className="privacy-chip">No row import</span>
    </div>
    {uploads.length === 0 ? <p className="muted">No source workbooks are stored yet.</p> : uploads.map((upload) => {
      const inspection = inspections[upload.id];
      return <article className="evidence-item" key={upload.id}>
        <div className="evidence-summary">
          <div><strong>{upload.original_filename}</strong><span>{upload.byte_size.toLocaleString()} bytes · {new Date(upload.created_at).toLocaleString()}</span></div>
          {inspection
            ? <span className="complete-badge">Inspected</span>
            : <button onClick={() => void inspect(upload)} disabled={!canInspect || busyId !== null}>
              {busyId === upload.id ? "Inspecting…" : "Inspect structure"}
            </button>}
        </div>
        {inspection && <div className="sheet-grid">
          {inspection.sheets.map((sheet) => <div className="sheet-card" key={sheet.name}>
            <strong>{sheet.name}</strong>
            <span>{sheet.rowCount.toLocaleString()} rows · {sheet.columnCount.toLocaleString()} columns</span>
            <span>Header candidate: {sheet.headerRow ? "row " + sheet.headerRow : "not found"}</span>
            {sheet.headers.length > 0 && <div className="header-list">{sheet.headers.map((header, index) =>
              header ? <code key={index}>{header}</code> : null)}</div>}
          </div>)}
          {inspection.warnings.length > 0 && <ul className="inspection-warnings">{inspection.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>}
        </div>}
      </article>;
    })}
    {!canInspect && <p className="warning">Your role can view source records but cannot inspect raw workbooks.</p>}
    {status && <p role="status" className="status">{status}</p>}
  </section>;
}
