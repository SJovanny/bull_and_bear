"use client";

import { useCallback, useEffect, useState } from "react";

import { DashboardShell } from "@/components/dashboard-shell";
import LoadingSpinner from "@/components/loading-spinner";

type AdminUser = {
  id: string;
  email: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  country: string | null;
  isAdmin: boolean;
  subscriptionStatus: string;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  hasStripeSubscription: boolean;
  hasStripeAccount: boolean;
  createdAt: string;
  _count: { trades: number; accounts: number };
};

type ListResponse = {
  users: AdminUser[];
  pagination: { page: number; pages: number; total: number };
  stats: { total: number; active: number; trialing: number; newThisWeek: number; admins: number };
  error?: string;
};

type GrantBody =
  | { type: "days"; days: number }
  | { type: "lifetime" }
  | { type: "revoke" };

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: "Actif", cls: "bg-pnl-positive/15 text-pnl-positive" },
  TRIALING: { label: "Essai / offert", cls: "bg-brand-500/15 text-brand-500" },
  PAST_DUE: { label: "Impayé", cls: "bg-discipline-mid/15 text-discipline-mid" },
  CANCELED: { label: "Annulé", cls: "bg-pnl-negative/15 text-pnl-negative" },
  EXPIRED: { label: "Expiré", cls: "bg-pnl-negative/15 text-pnl-negative" },
  INACTIVE: { label: "Aucun", cls: "bg-surface-2 text-secondary" },
};

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function StatusBadge({ user }: { user: AdminUser }) {
  const expiredTrial =
    user.subscriptionStatus === "TRIALING" && user.trialEndsAt && new Date(user.trialEndsAt) <= new Date();
  const key = expiredTrial ? "EXPIRED" : user.subscriptionStatus;
  const s = STATUS_LABELS[key] ?? STATUS_LABELS.INACTIVE;
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

const inputCls =
  "w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-primary outline-none focus:border-brand-500";
const btnCls =
  "rounded-md border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium text-primary transition hover:border-brand-500 disabled:opacity-50";
const primaryBtnCls =
  "rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-500 disabled:opacity-50";

export default function AdminPage() {
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const [showInvite, setShowInvite] = useState(false);
  const [grantTarget, setGrantTarget] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const [reloadKey, setReloadKey] = useState(0);
  const load = useCallback(async () => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page: String(page) });
        if (query) params.set("q", query);
        if (status) params.set("status", status);
        const res = await fetch(`/api/admin/users?${params}`);
        const json = (await res.json()) as ListResponse;
        if (!res.ok) throw new Error(json.error ?? "Chargement impossible");
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }
    void fetchUsers();
  }, [page, query, status, reloadKey]);

  async function patchUser(id: string, body: { grant?: GrantBody; isAdmin?: boolean }, okMsg: string) {
    setError(null);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(json.error ?? "Action impossible");
      return false;
    }
    setNotice(okMsg);
    await load();
    return true;
  }

  async function deleteUser(user: AdminUser) {
    setError(null);
    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(json.error ?? "Suppression impossible");
      return;
    }
    setDeleteTarget(null);
    setNotice(`${user.email} supprimé.`);
    await load();
  }

  const stats = data?.stats;

  return (
    <DashboardShell
      title="Admin"
      subtitle="Utilisateurs"
      skipSubscriptionCheck
      actions={
        <button type="button" className={primaryBtnCls} onClick={() => setShowInvite(true)}>
          + Inviter
        </button>
      }
    >
      <div className="mx-auto max-w-7xl space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            ["Utilisateurs", stats?.total],
            ["Abonnés actifs", stats?.active],
            ["En essai / offerts", stats?.trialing],
            ["Nouveaux (7 j)", stats?.newThisWeek],
            ["Admins", stats?.admins],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-lg border border-border bg-surface-1 p-4">
              <div className="text-xs text-secondary">{label}</div>
              <div className="mt-1 text-2xl font-semibold text-primary">{value ?? "—"}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className={inputCls}
            placeholder="Rechercher (email, nom)…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className={`${inputCls} sm:w-56`}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        {notice && (
          <div className="flex items-center justify-between rounded-md border border-pnl-positive/40 bg-pnl-positive/10 px-3 py-2 text-sm text-pnl-positive">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice(null)} aria-label="Fermer">
              ×
            </button>
          </div>
        )}
        {error && (
          <div className="rounded-md border border-pnl-negative/40 bg-pnl-negative/10 px-3 py-2 text-sm text-pnl-negative">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-border bg-surface-1">
          {loading && !data ? (
            <LoadingSpinner />
          ) : (
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-border text-xs uppercase text-secondary">
                <tr>
                  <th className="px-4 py-3">Utilisateur</th>
                  <th className="px-4 py-3">Abonnement</th>
                  <th className="px-4 py-3">Expire</th>
                  <th className="px-4 py-3 text-right">Trades</th>
                  <th className="px-4 py-3">Inscrit</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={loading ? "opacity-60" : ""}>
                {data?.users.map((u) => {
                  const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.displayName;
                  const expiry = u.subscriptionStatus === "TRIALING" ? u.trialEndsAt : u.currentPeriodEnd;
                  return (
                    <tr key={u.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 font-medium text-primary">
                          {name ?? "—"}
                          {u.isAdmin && (
                            <span className="rounded bg-brand-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-brand-500">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-secondary">
                          {u.email}
                          {u.country ? ` · ${u.country}` : ""}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge user={u} />
                        <div className="mt-1 text-[11px] text-secondary">
                          {u.hasStripeSubscription ? "Stripe" : u.subscriptionStatus === "INACTIVE" ? "" : "Offert"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-secondary">
                        {u.subscriptionStatus === "ACTIVE" && !u.hasStripeSubscription ? "Illimité" : fmtDate(expiry)}
                      </td>
                      <td className="px-4 py-3 text-right text-secondary">{u._count.trades}</td>
                      <td className="px-4 py-3 text-secondary">{fmtDate(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          <button type="button" className={btnCls} onClick={() => setGrantTarget(u)}>
                            Offrir
                          </button>
                          <button
                            type="button"
                            className={btnCls}
                            onClick={() =>
                              void patchUser(
                                u.id,
                                { isAdmin: !u.isAdmin },
                                u.isAdmin ? `${u.email} n'est plus admin.` : `${u.email} est maintenant admin.`,
                              )
                            }
                          >
                            {u.isAdmin ? "Retirer admin" : "Admin"}
                          </button>
                          <button
                            type="button"
                            className={`${btnCls} text-pnl-negative`}
                            onClick={() => setDeleteTarget(u)}
                          >
                            Suppr.
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {data && data.users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-secondary">
                      Aucun utilisateur trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {data && (
          <div className="flex items-center justify-between text-sm text-secondary">
            <span>
              {data.pagination.total} utilisateur{data.pagination.total > 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-2">
              <button type="button" className={btnCls} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Précédent
              </button>
              <span>
                {data.pagination.page} / {data.pagination.pages}
              </span>
              <button
                type="button"
                className={btnCls}
                disabled={page >= data.pagination.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onDone={(msg) => {
            setShowInvite(false);
            setNotice(msg);
            void load();
          }}
        />
      )}

      {grantTarget && (
        <GrantModal
          user={grantTarget}
          onClose={() => setGrantTarget(null)}
          onSubmit={async (grant, msg) => {
            const ok = await patchUser(grantTarget.id, { grant }, msg);
            if (ok) setGrantTarget(null);
          }}
        />
      )}

      {deleteTarget && (
        <Modal title="Supprimer l'utilisateur" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-secondary">
            Supprimer définitivement <strong className="text-primary">{deleteTarget.email}</strong> et toutes ses
            données (comptes, trades, journaux) ? Cette action est irréversible.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" className={btnCls} onClick={() => setDeleteTarget(null)}>
              Annuler
            </button>
            <button
              type="button"
              className="rounded-md bg-pnl-negative px-4 py-2 text-sm font-medium text-white"
              onClick={() => void deleteUser(deleteTarget)}
            >
              Supprimer
            </button>
          </div>
        </Modal>
      )}
    </DashboardShell>
  );
}

// ─── Modals ──────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-surface-1 p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <h2 className="mb-3 text-lg font-semibold text-primary">{title}</h2>
        {children}
      </div>
    </div>
  );
}

type GrantChoice = "days" | "lifetime" | "revoke";

function GrantFields({
  choice,
  setChoice,
  days,
  setDays,
}: {
  choice: GrantChoice;
  setChoice: (c: GrantChoice) => void;
  days: number;
  setDays: (d: number) => void;
}) {
  return (
    <div className="space-y-2 text-sm text-primary">
      <label className="flex items-center gap-2">
        <input type="radio" checked={choice === "days"} onChange={() => setChoice("days")} />
        Offrir
        <input
          type="number"
          min={1}
          max={3650}
          value={days}
          onChange={(e) => setDays(Math.max(1, Math.min(3650, Number(e.target.value) || 1)))}
          onFocus={() => setChoice("days")}
          className="w-20 rounded-md border border-border bg-surface-2 px-2 py-1"
        />
        jours
      </label>
      <label className="flex items-center gap-2">
        <input type="radio" checked={choice === "lifetime"} onChange={() => setChoice("lifetime")} />
        Accès illimité (à vie)
      </label>
      {choice === "revoke" || (
        <div className="flex gap-1.5 pt-1">
          {[7, 30, 90, 365].map((d) => (
            <button
              key={d}
              type="button"
              className={btnCls}
              onClick={() => {
                setChoice("days");
                setDays(d);
              }}
            >
              {d} j
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function toGrant(choice: GrantChoice, days: number): GrantBody {
  return choice === "days" ? { type: "days", days } : choice === "lifetime" ? { type: "lifetime" } : { type: "revoke" };
}

function GrantModal({
  user,
  onClose,
  onSubmit,
}: {
  user: AdminUser;
  onClose: () => void;
  onSubmit: (grant: GrantBody, msg: string) => Promise<void>;
}) {
  const [choice, setChoice] = useState<GrantChoice>("days");
  const [days, setDays] = useState(30);
  const [busy, setBusy] = useState(false);
  const stripeActive = user.hasStripeSubscription && user.subscriptionStatus === "ACTIVE";

  async function submit(c: GrantChoice) {
    setBusy(true);
    const msg =
      c === "revoke"
        ? `Accès retiré pour ${user.email}.`
        : c === "lifetime"
          ? `Accès illimité offert à ${user.email}.`
          : `${days} jours offerts à ${user.email}.`;
    await onSubmit(toGrant(c, days), msg);
    setBusy(false);
  }

  return (
    <Modal title="Offrir un abonnement" onClose={onClose}>
      <p className="mb-3 text-sm text-secondary">{user.email}</p>
      {stripeActive ? (
        <p className="text-sm text-discipline-mid">
          Cet utilisateur a un abonnement Stripe actif : à gérer depuis Stripe.
        </p>
      ) : (
        <>
          <GrantFields choice={choice} setChoice={setChoice} days={days} setDays={setDays} />
          <p className="mt-2 text-xs text-secondary">
            Si un accès offert est encore en cours, les jours s&apos;ajoutent à la date d&apos;expiration actuelle.
          </p>
        </>
      )}
      <div className="mt-4 flex justify-between gap-2">
        <button
          type="button"
          className={`${btnCls} text-pnl-negative`}
          disabled={busy || stripeActive}
          onClick={() => void submit("revoke")}
        >
          Retirer l&apos;accès
        </button>
        <div className="flex gap-2">
          <button type="button" className={btnCls} onClick={onClose}>
            Annuler
          </button>
          <button
            type="button"
            className={primaryBtnCls}
            disabled={busy || stripeActive || choice === "revoke"}
            onClick={() => void submit(choice)}
          >
            Confirmer
          </button>
        </div>
      </div>
    </Modal>
  );
}

function InviteModal({ onClose, onDone }: { onClose: () => void; onDone: (msg: string) => void }) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [withGrant, setWithGrant] = useState(true);
  const [choice, setChoice] = useState<GrantChoice>("days");
  const [days, setDays] = useState(30);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          ...(firstName ? { firstName } : {}),
          ...(lastName ? { lastName } : {}),
          ...(withGrant ? { grant: toGrant(choice, days) } : {}),
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Invitation impossible");
      onDone(`Invitation envoyée à ${email}.`);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Erreur inconnue");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Inviter un utilisateur" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="email"
          required
          className={inputCls}
          placeholder="email@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <input className={inputCls} placeholder="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <input className={inputCls} placeholder="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm text-primary">
          <input type="checkbox" checked={withGrant} onChange={(e) => setWithGrant(e.target.checked)} />
          Offrir un abonnement à l&apos;invitation
        </label>
        {withGrant && <GrantFields choice={choice === "revoke" ? "days" : choice} setChoice={setChoice} days={days} setDays={setDays} />}
        {err && <p className="text-sm text-pnl-negative">{err}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className={btnCls} onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className={primaryBtnCls} disabled={busy}>
            {busy ? "Envoi…" : "Envoyer l'invitation"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
