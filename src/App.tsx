import { useEffect, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import { buildStoragePath, sha256Hex, validateWorkbook } from "./lib/upload";

type Membership = {
  organisation_id: string;
  role: "operator" | "manager" | "client_viewer";
  organisations: { display_name: string } | null;
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

function SignIn() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus("Sending secure sign-in link…");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setStatus(error ? error.message : "Check your email for the secure sign-in link.");
  }

  return <main className="center">
    <section className="panel auth-panel">
      <span className="eyebrow">Bulk GSM operations</span>
      <h1>ITAD Dash</h1>
      <p className="muted">Secure evidence in. Clear outcomes out.</p>
      <form onSubmit={submit}>
        <label htmlFor="email">Work email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <button type="submit">Send secure link</button>
      </form>
      {status && <p role="status" className="status">{status}</p>}
    </section>
  </main>;
}

function Workspace({ user }: { user: User }) {
  const [membership, setMembership] = useState<Membership | null>(null);
  const [membershipError, setMembershipError] = useState<string | null>(null);

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
      <div><span className="eyebrow">Slice A</span><h1>Secure source upload</h1><p>Store a synthetic Securaze workbook for staged processing. Nothing is imported yet.</p></div>
      <div className="trust"><strong>Private by design</strong><span>Organisation-scoped storage</span><span>Immutable source record</span><span>No browser secrets</span></div>
    </section>
    {membershipError ? <section className="panel warning" role="alert">{membershipError}</section> : membership ? <UploadCard user={user} membership={membership} /> : <p>Loading organisation access…</p>}
  </main>;
}

function UploadCard({ user, membership }: { user: User; membership: Membership }) {
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
