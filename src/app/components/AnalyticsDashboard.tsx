import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, MousePointerClick, Users, Globe } from "lucide-react";
import type { LinkItem } from "../App";
import { getAnalytics, type AnalyticsSummary } from "../backend";

interface AnalyticsDashboardProps {
  links: LinkItem[];
}

const FALLBACK_DEVICE_DATA = [
  { name: "Mobile", value: 64, color: "#a855f7" },
  { name: "Desktop", value: 28, color: "#3b82f6" },
  { name: "Tablet", value: 8, color: "#ec4899" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-xl px-3 py-2"
        style={{ background: "#1a1a2e", border: "1px solid rgba(168,85,247,0.3)", fontSize: "12px" }}
      >
        <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "2px" }}>{label}</p>
        <p style={{ color: "#c084fc", fontWeight: 600 }}>{payload[0].value} clicks</p>
      </div>
    );
  }
  return null;
};

const BarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-xl px-3 py-2"
        style={{ background: "#1a1a2e", border: "1px solid rgba(168,85,247,0.3)", fontSize: "12px" }}
      >
        <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "2px" }}>{label}</p>
        <p style={{ color: "#c084fc", fontWeight: 600 }}>{payload[0].value} clicks</p>
      </div>
    );
  }
  return null;
};

export function AnalyticsDashboard({ links }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    getAnalytics().then(setAnalytics).catch(() => setAnalytics(null));
  }, [links]);

  const dailyData = analytics?.dailyData ?? [];
  const linkClickData = analytics?.linkClickData ?? [];
  const deviceData = analytics?.deviceData ?? FALLBACK_DEVICE_DATA;
  const geoData = analytics?.geoData ?? [];

  const totalClicks = dailyData.reduce((sum, d) => sum + d.clicks, 0);
  const todayClicks = dailyData[dailyData.length - 1]?.clicks ?? 0;
  const avgClicks = dailyData.length ? Math.round(totalClicks / dailyData.length) : 0;
  const topLink = linkClickData[0]?.name ?? "—";

  const STATS = [
    { label: "Total Clicks", value: totalClicks.toLocaleString(), icon: MousePointerClick, color: "#a855f7", change: "+12%" },
    { label: "Today", value: todayClicks.toString(), icon: TrendingUp, color: "#ec4899", change: "+8%" },
    { label: "Daily Average", value: avgClicks.toString(), icon: Users, color: "#3b82f6", change: "+5%" },
    { label: "Top Link", value: topLink, icon: Globe, color: "#10b981", change: `${geoData[0]?.visits.toLocaleString() ?? 0} visits` },
  ];

  return (
    <div className="space-y-5">
      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-4"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${stat.color}18` }}
              >
                <stat.icon size={16} style={{ color: stat.color }} />
              </div>
              <span
                className="px-2 py-0.5 rounded-full"
                style={{ fontSize: "11px", fontWeight: 500, background: "rgba(16,185,129,0.12)", color: "#34d399" }}
              >
                {stat.change}
              </span>
            </div>
            <p className="text-white" style={{ fontSize: "22px", fontWeight: 700 }}>
              {stat.value}
            </p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Click trends */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white" style={{ fontSize: "14px", fontWeight: 600 }}>
            Click Trends
          </h3>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>Last 30 days</span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="date"
              tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval={6}
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="clicks"
              stroke="#a855f7"
              strokeWidth={2}
              fill="url(#clickGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Links performance */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <h3 className="text-white mb-5" style={{ fontSize: "14px", fontWeight: 600 }}>
          Link Performance
        </h3>
        {linkClickData.length > 0 ? (
          <ResponsiveContainer width="100%" height={Math.max(120, linkClickData.length * 36)}>
            <BarChart
              data={linkClickData}
              layout="vertical"
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <Tooltip content={<BarTooltip />} />
              <Bar dataKey="clicks" fill="#a855f7" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "20px 0" }}>
            No visible links to display
          </p>
        )}
      </div>

      {/* Device + Geo row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Device breakdown */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <h3 className="text-white mb-4" style={{ fontSize: "13px", fontWeight: 600 }}>
            Devices
          </h3>
          <div className="flex justify-center mb-3">
            <PieChart width={100} height={100}>
              <Pie data={deviceData} cx={50} cy={50} innerRadius={28} outerRadius={44} dataKey="value" strokeWidth={0}>
                {deviceData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </div>
          <div className="space-y-2">
            {deviceData.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{d.name}</span>
                </div>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                  {d.value}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Geo */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <h3 className="text-white mb-4" style={{ fontSize: "13px", fontWeight: 600 }}>
            Top Countries
          </h3>
          <div className="space-y-2.5">
            {geoData.slice(0, 5).map((geo, i) => {
              const maxVisits = geoData[0]?.visits || 1;
              const pct = (geo.visits / maxVisits) * 100;
              return (
                <div key={geo.country}>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{geo.country}</span>
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{geo.visits.toLocaleString()}</span>
                  </div>
                  <div
                    className="rounded-full overflow-hidden"
                    style={{ height: "3px", background: "rgba(255,255,255,0.07)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: `hsl(${270 - i * 20}, 70%, 60%)` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
