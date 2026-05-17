import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, BarChart3, Globe2, MousePointerClick, RefreshCw, TrendingUp } from "lucide-react";
import type { LinkItem } from "../App";
import { getAnalytics, type AnalyticsSummary } from "../backend";

interface AnalyticsDashboardProps {
  links: LinkItem[];
}

const PANEL = "rgba(255,255,255,0.055)";
const PANEL_STRONG = "rgba(255,255,255,0.08)";
const BORDER = "rgba(255,255,255,0.09)";
const TEXT = "#f8fafc";
const MUTED = "rgba(248,250,252,0.56)";
const SOFT = "rgba(248,250,252,0.34)";
const ACCENT = "#a78bfa";

const EMPTY_ANALYTICS: AnalyticsSummary = {
  dailyData: [],
  linkClickData: [],
  countryData: [],
};

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 shadow-xl"
      style={{ background: "rgba(12,12,24,0.96)", border: `1px solid ${BORDER}`, fontSize: "12px" }}
    >
      <p style={{ color: SOFT, marginBottom: "2px" }}>{label}</p>
      <p style={{ color: ACCENT, fontWeight: 800 }}>{payload[0].value} clicks</p>
    </div>
  );
};

function EmptyPanel({ title }: { title: string }) {
  return (
    <div
      className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed px-4 text-center"
      style={{ borderColor: "rgba(255,255,255,0.1)", color: SOFT, fontSize: "13px" }}
    >
      {title}
    </div>
  );
}

function countryLabel(country: string) {
  if (country === "Unknown") return "Unknown";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(country) ?? country;
  } catch {
    return country;
  }
}

export function AnalyticsDashboard({ links }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(EMPTY_ANALYTICS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async (isRefresh = false) => {
    try {
      setError(null);
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setAnalytics(await getAnalytics());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analytics could not be loaded.");
      setAnalytics(EMPTY_ANALYTICS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadAnalytics(false);
  }, [loadAnalytics, links.length]);

  const visibleLinkCount = links.filter((link) => link.visible).length;
  const dailyData = analytics.dailyData;
  const linkClickData = analytics.linkClickData.filter((link) => link.clicks > 0);
  const countryData = analytics.countryData;

  const totalClicks = useMemo(
    () => analytics.linkClickData.reduce((sum, link) => sum + link.clicks, 0),
    [analytics.linkClickData]
  );
  const todayClicks = dailyData[dailyData.length - 1]?.clicks ?? 0;
  const activeDays = dailyData.filter((day) => day.clicks > 0).length;
  const topCountry = countryData[0] ? countryLabel(countryData[0].country) : "No country data";

  const stats = [
    { label: "Total clicks", value: totalClicks.toLocaleString(), icon: MousePointerClick, color: "#a78bfa", meta: `${visibleLinkCount} visible links` },
    { label: "Today", value: todayClicks.toLocaleString(), icon: Activity, color: "#38bdf8", meta: "Current day" },
    { label: "Active days", value: activeDays.toString(), icon: TrendingUp, color: "#34d399", meta: "Last 30 days" },
    { label: "Top country", value: topCountry, icon: Globe2, color: "#f472b6", meta: countryData[0] ? `${countryData[0].visits} clicks` : "Waiting for traffic" },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-[116px] animate-pulse rounded-lg" style={{ background: PANEL }} />
          ))}
        </div>
        <div className="h-[260px] animate-pulse rounded-lg" style={{ background: PANEL }} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p style={{ color: SOFT, fontSize: "12px", fontWeight: 700, textTransform: "uppercase" }}>Last 30 days</p>
          <h2 style={{ color: TEXT, fontSize: "18px", fontWeight: 900, marginTop: "2px" }}>Performance</h2>
        </div>
        <button
          type="button"
          onClick={() => void loadAnalytics(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors"
          style={{ background: PANEL_STRONG, border: `1px solid ${BORDER}`, color: MUTED, fontSize: "13px", fontWeight: 800, opacity: refreshing ? 0.65 : 1 }}
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg px-4 py-3" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(248,113,113,0.28)", color: "#fecaca", fontSize: "13px" }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg p-4" style={{ background: PANEL, border: `1px solid ${BORDER}` }}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${stat.color}18`, color: stat.color }}>
                <stat.icon size={17} />
              </div>
              <BarChart3 size={15} style={{ color: SOFT }} />
            </div>
            <p className="truncate" title={stat.value} style={{ color: TEXT, fontSize: stat.label === "Top country" ? "17px" : "24px", fontWeight: 900, lineHeight: 1.05 }}>
              {stat.value}
            </p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <p style={{ color: MUTED, fontSize: "12px", fontWeight: 700 }}>{stat.label}</p>
              <p className="truncate text-right" style={{ color: SOFT, fontSize: "11px" }}>{stat.meta}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg p-5" style={{ background: PANEL, border: `1px solid ${BORDER}` }}>
        <div className="mb-4 flex items-center justify-between">
          <h3 style={{ color: TEXT, fontSize: "14px", fontWeight: 850 }}>Click trend</h3>
          <span style={{ color: SOFT, fontSize: "12px" }}>{totalClicks.toLocaleString()} total</span>
        </div>
        {dailyData.some((day) => day.clicks > 0) ? (
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={dailyData} margin={{ top: 8, right: 6, left: -26, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsClickGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.34} />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 6" stroke="rgba(255,255,255,0.055)" vertical={false} />
              <XAxis dataKey="date" interval={6} tick={{ fill: SOFT, fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: SOFT, fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="clicks" stroke="#a78bfa" strokeWidth={2.5} fill="url(#analyticsClickGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyPanel title="No clicks in this period" />
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-lg p-5" style={{ background: PANEL, border: `1px solid ${BORDER}` }}>
          <h3 className="mb-4" style={{ color: TEXT, fontSize: "14px", fontWeight: 850 }}>Links</h3>
          {linkClickData.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(150, Math.min(280, linkClickData.length * 42))}>
              <BarChart data={linkClickData.slice(0, 8)} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 6" stroke="rgba(255,255,255,0.055)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fill: SOFT, fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" width={118} tick={{ fill: MUTED, fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="clicks" fill="#a78bfa" radius={[0, 7, 7, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyPanel title="No link clicks yet" />
          )}
        </div>

        <div className="rounded-lg p-5" style={{ background: PANEL, border: `1px solid ${BORDER}` }}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 style={{ color: TEXT, fontSize: "14px", fontWeight: 850 }}>Countries</h3>
            <span style={{ color: SOFT, fontSize: "12px" }}>Clicks by country</span>
          </div>
          {countryData.length > 0 ? (
            <div className="space-y-4">
              {countryData.slice(0, 7).map((country, index) => {
                const maxVisits = countryData[0]?.visits || 1;
                const share = totalClicks ? Math.round((country.visits / totalClicks) * 100) : 0;
                return (
                  <div key={country.country}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate" style={{ color: TEXT, fontSize: "13px", fontWeight: 800 }}>
                          {countryLabel(country.country)}
                        </p>
                        <p style={{ color: SOFT, fontSize: "11px" }}>{share}% of all clicks</p>
                      </div>
                      <div className="text-right">
                        <p style={{ color: TEXT, fontSize: "13px", fontWeight: 900 }}>{country.visits.toLocaleString()}</p>
                        <p style={{ color: SOFT, fontSize: "11px" }}>clicks</p>
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(country.visits / maxVisits) * 100}%`, background: ["#a78bfa", "#38bdf8", "#34d399", "#f472b6", "#f59e0b", "#60a5fa", "#fb7185"][index] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyPanel title="No country clicks yet" />
          )}
        </div>
      </div>
    </div>
  );
}
