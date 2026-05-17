import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  Link2,
  LogOut,
  MailWarning,
  MousePointerClick,
  Puzzle,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import * as backend from "../backend";

type Filter = "all" | "verified" | "unverified" | "admins" | "oauth";

interface AdminPanelProps {
  onBack: () => void;
  onLogout: () => void;
}

const THEME = {
  bg: "#07070f",
  panel: "#0f0f1d",
  panelSoft: "rgba(255,255,255,0.055)",
  border: "rgba(255,255,255,0.08)",
  text: "#ffffff",
  muted: "rgba(255,255,255,0.58)",
  soft: "rgba(255,255,255,0.36)",
  violet: "#a855f7",
  pink: "#db2777",
  green: "#34d399",
  amber: "#f59e0b",
  red: "#f87171",
  blue: "#38bdf8",
};

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unverified", label: "Unverified" },
  { id: "verified", label: "Verified" },
  { id: "admins", label: "Admins" },
  { id: "oauth", label: "OAuth" },
];

function formatDate(value: string | null) {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function profileUrl(username: string) {
  return `/${encodeURIComponent(username)}`;
}

function StatusPill({ verified }: { verified: boolean }) {
  const Icon = verified ? CheckCircle2 : XCircle;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
      style={{
        background: verified ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.12)",
        color: verified ? THEME.green : THEME.red,
        border: `1px solid ${verified ? "rgba(52,211,153,0.24)" : "rgba(248,113,113,0.26)"}`,
        fontSize: "12px",
        fontWeight: 800,
      }}
    >
      <Icon size={13} />
      {verified ? "Verified" : "Unverified"}
    </span>
  );
}

function MetricCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: LucideIcon; color: string }) {
  return (
    <div className="rounded-lg border p-4" style={{ background: THEME.panel, borderColor: THEME.border }}>
      <div className="mb-3 flex items-center justify-between">
        <span style={{ color: THEME.muted, fontSize: "12px", fontWeight: 800, textTransform: "uppercase" }}>{label}</span>
        <Icon size={16} color={color} />
      </div>
      <p style={{ color: THEME.text, fontSize: "26px", fontWeight: 950, lineHeight: 1 }}>{value}</p>
    </div>
  );
}

export function AdminPanel({ onBack, onLogout }: AdminPanelProps) {
  const [data, setData] = useState<backend.AdminUsersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      setData(await backend.getAdminUsers());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Admin data could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (data?.users ?? []).filter((user) => {
      const matchesQuery =
        !needle ||
        user.email.toLowerCase().includes(needle) ||
        user.username.toLowerCase().includes(needle) ||
        user.displayName.toLowerCase().includes(needle);
      const matchesFilter =
        filter === "all" ||
        (filter === "verified" && user.isEmailVerified) ||
        (filter === "unverified" && !user.isEmailVerified) ||
        (filter === "admins" && user.isAdmin) ||
        (filter === "oauth" && user.authProviders.some((provider) => provider !== "password"));
      return matchesQuery && matchesFilter;
    });
  }, [data?.users, filter, query]);

  const summary = data?.summary;

  return (
    <div className="min-h-dvh overflow-x-hidden" style={{ background: THEME.bg, color: THEME.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: THEME.border }}>
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-lg border transition-colors hover:bg-white/5"
              style={{ borderColor: THEME.border, color: THEME.muted }}
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} color={THEME.violet} />
                <h1 style={{ fontSize: "24px", fontWeight: 950 }}>Admin</h1>
              </div>
              <p style={{ color: THEME.soft, fontSize: "13px", marginTop: "3px" }}>
                Accounts, email verification, and profile activity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors hover:bg-white/5"
              style={{ borderColor: THEME.border, color: THEME.muted, fontSize: "13px", opacity: loading ? 0.65 : 1 }}
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors hover:bg-white/5"
              style={{ borderColor: THEME.border, color: THEME.red, fontSize: "13px" }}
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </header>

        {error ? (
          <div className="rounded-lg border px-4 py-3" style={{ background: "rgba(248,113,113,0.1)", borderColor: "rgba(248,113,113,0.28)", color: "#fecaca" }}>
            {error}
          </div>
        ) : null}

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Accounts" value={(summary?.totalUsers ?? 0).toLocaleString()} icon={Users} color={THEME.blue} />
          <MetricCard label="Unverified" value={(summary?.unverifiedUsers ?? 0).toLocaleString()} icon={MailWarning} color={THEME.amber} />
          <MetricCard label="Admins" value={(summary?.adminUsers ?? 0).toLocaleString()} icon={ShieldCheck} color={THEME.violet} />
          <MetricCard label="Total clicks" value={(summary?.totalClicks ?? 0).toLocaleString()} icon={MousePointerClick} color={THEME.green} />
        </section>

        <section className="mt-5 rounded-lg border" style={{ background: THEME.panel, borderColor: THEME.border }}>
          <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between" style={{ borderColor: THEME.border }}>
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" size={16} color={THEME.soft} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by email, username, or name"
                className="w-full rounded-lg border py-2.5 pl-10 pr-3 outline-none"
                style={{ background: THEME.panelSoft, borderColor: THEME.border, color: THEME.text, fontSize: "14px" }}
              />
            </div>

            <div className="flex gap-1 overflow-x-auto rounded-lg p-1" style={{ background: "rgba(255,255,255,0.045)" }}>
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFilter(item.id)}
                  className="rounded-md px-3 py-2 transition-colors"
                  style={{
                    background: filter === item.id ? THEME.text : "transparent",
                    color: filter === item.id ? THEME.bg : THEME.muted,
                    fontSize: "13px",
                    fontWeight: 850,
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse">
              <thead>
                <tr style={{ color: THEME.soft, fontSize: "12px", textTransform: "uppercase" }}>
                  {["Account", "Email", "Created", "Status", "Content", "Clicks", "Verification"].map((label) => (
                    <th key={label} className="border-b px-4 py-3 text-left" style={{ borderColor: THEME.border, fontWeight: 900 }}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center" style={{ color: THEME.muted }}>
                      Loading accounts...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center" style={{ color: THEME.muted }}>
                      No accounts match this view.
                    </td>
                  </tr>
                ) : (
                  rows.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-white/[0.025]">
                      <td className="border-b px-4 py-4 align-top" style={{ borderColor: THEME.border }}>
                        <div className="flex items-start gap-3">
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                            style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.32), rgba(219,39,119,0.26))", color: THEME.text, fontSize: "12px", fontWeight: 900 }}
                          >
                            {user.username.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate" style={{ fontWeight: 900, maxWidth: "210px" }}>{user.displayName}</p>
                              {user.isAdmin ? <ShieldCheck size={14} color={THEME.violet} /> : null}
                            </div>
                            <a className="inline-flex items-center gap-1 hover:text-white" href={profileUrl(user.username)} style={{ color: THEME.soft, fontSize: "12px" }}>
                              @{user.username}
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="border-b px-4 py-4 align-top" style={{ borderColor: THEME.border }}>
                        <p style={{ color: THEME.text, fontSize: "13px", fontWeight: 700 }}>{user.email}</p>
                        <p className="mt-1 flex items-center gap-1.5" style={{ color: THEME.soft, fontSize: "12px" }}>
                          <KeyRound size={12} />
                          {user.authProviders.join(", ")}
                        </p>
                      </td>
                      <td className="border-b px-4 py-4 align-top" style={{ borderColor: THEME.border, color: THEME.muted, fontSize: "13px" }}>
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="border-b px-4 py-4 align-top" style={{ borderColor: THEME.border }}>
                        <StatusPill verified={user.isEmailVerified} />
                        <p className="mt-2" style={{ color: THEME.soft, fontSize: "12px" }}>
                          Confirmed: {formatDate(user.emailVerifiedAt)}
                        </p>
                      </td>
                      <td className="border-b px-4 py-4 align-top" style={{ borderColor: THEME.border }}>
                        <div className="flex flex-col gap-1.5" style={{ color: THEME.muted, fontSize: "13px" }}>
                          <span className="inline-flex items-center gap-1.5">
                            <Link2 size={13} color={THEME.blue} />
                            {user.visibleLinksCount}/{user.linksCount} links visible
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Puzzle size={13} color={THEME.pink} />
                            {user.visibleWidgetsCount}/{user.widgetsCount} widgets visible
                          </span>
                        </div>
                      </td>
                      <td className="border-b px-4 py-4 align-top" style={{ borderColor: THEME.border, fontSize: "13px", fontWeight: 900 }}>
                        {user.totalClicks.toLocaleString()}
                      </td>
                      <td className="border-b px-4 py-4 align-top" style={{ borderColor: THEME.border, color: THEME.muted, fontSize: "13px" }}>
                        {user.pendingVerification ? (
                          <>
                            <p>{user.pendingVerification.activeTokens} active token(s)</p>
                            <p className="mt-1" style={{ color: THEME.soft }}>Expires: {formatDate(user.pendingVerification.expiresAt)}</p>
                          </>
                        ) : (
                          <span style={{ color: THEME.soft }}>None pending</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
