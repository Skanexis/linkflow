import { useEffect, useState } from "react";
import {
  User,
  Link2,
  Palette,
  BarChart3,
  Puzzle,
  LogOut,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import type { UserProfile, LinkItem, ProfileTheme, WidgetItem } from "../App";
import { ProfileEditor } from "./ProfileEditor";
import { LinksManager } from "./LinksManager";
import { AppearanceEditor } from "./AppearanceEditor";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { WidgetsPanel } from "./WidgetsPanel";
import { PublicProfile } from "./PublicProfile";

type Section = "profile" | "links" | "appearance" | "analytics" | "widgets";

interface DashboardProps {
  profile: UserProfile;
  links: LinkItem[];
  theme: ProfileTheme;
  widgets: WidgetItem[];
  onUpdateProfile: (u: Partial<UserProfile>) => void;
  onAddLink: (l: Omit<LinkItem, "id">) => void;
  onUpdateLink: (id: string, u: Partial<LinkItem>) => void;
  onRemoveLink: (id: string) => void;
  onReorderLinks: (from: number, to: number) => void;
  onUpdateTheme: (u: Partial<ProfileTheme>) => void;
  onAddWidget: (w: Omit<WidgetItem, "id">) => void;
  onUpdateWidget: (id: string, u: Partial<WidgetItem>) => void;
  onRemoveWidget: (id: string) => void;
  onViewProfile: () => void;
  onLogout: () => void;
}

const NAV_ITEMS: { id: Section; icon: React.ComponentType<any>; label: string }[] = [
  { id: "profile", icon: User, label: "Profile" },
  { id: "links", icon: Link2, label: "Links" },
  { id: "appearance", icon: Palette, label: "Appearance" },
  { id: "analytics", icon: BarChart3, label: "Analytics" },
  { id: "widgets", icon: Puzzle, label: "Widgets" },
];

export function Dashboard({
  profile,
  links,
  theme,
  widgets,
  onUpdateProfile,
  onAddLink,
  onUpdateLink,
  onRemoveLink,
  onReorderLinks,
  onUpdateTheme,
  onAddWidget,
  onUpdateWidget,
  onRemoveWidget,
  onViewProfile,
  onLogout,
}: DashboardProps) {
  const [section, setSection] = useState<Section>("links");
  const [showPreview, setShowPreview] = useState(true);
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentSection = NAV_ITEMS.find((n) => n.id === section)!;
  const isTablet = viewportWidth < 1180;
  const isMobile = viewportWidth < 820;
  const sidebarWidth = isTablet ? 76 : 220;
  const previewPanelWidth = isMobile ? "100%" : isTablet ? "260px" : "300px";
  const availablePreviewWidth = isMobile ? Math.max(280, viewportWidth - 32) : isTablet ? 228 : 224;
  const phoneFrameWidth = Math.min(isMobile ? 300 : availablePreviewWidth, isMobile ? viewportWidth - 44 : availablePreviewWidth);
  const phoneScale = Math.max(0.52, Math.min(0.74, (phoneFrameWidth - 12) / 375));
  const phoneFrameHeight = Math.min(isMobile ? 520 : 460, Math.round(814 * phoneScale) + 12);

  return (
    <div
      className="h-full overflow-hidden"
      style={{
        background: "#07070f",
        fontFamily: "'Inter', system-ui, sans-serif",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
      }}
    >
      {/* Sidebar */}
      <aside
        className="flex-shrink-0 overflow-hidden"
        style={{
          width: isMobile ? "100%" : `${sidebarWidth}px`,
          height: isMobile ? "auto" : "100%",
          background: "#0a0a16",
          borderRight: isMobile ? "none" : "1px solid rgba(255,255,255,0.05)",
          borderBottom: isMobile ? "1px solid rgba(255,255,255,0.05)" : "none",
          display: "flex",
          flexDirection: isMobile ? "row" : "column",
          alignItems: isMobile ? "center" : "stretch",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2 px-5 py-5"
          style={{
            borderBottom: isMobile ? "none" : "1px solid rgba(255,255,255,0.05)",
            padding: isTablet ? "14px" : "20px",
            justifyContent: isTablet && !isMobile ? "center" : "flex-start",
          }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)", boxShadow: "0 0 16px rgba(124,58,237,0.4)" }}
          >
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="text-white" style={{ fontWeight: 700, fontSize: "16px", display: isTablet ? "none" : "inline" }}>
            LinkFlow
          </span>
        </div>

        {/* Profile mini */}
        {!isTablet && (
        <div className="px-4 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-3">
            <div
              className="rounded-full flex items-center justify-center text-white flex-shrink-0"
              style={{
                width: "36px",
                height: "36px",
                background: profile.avatarColor,
                fontSize: "12px",
                fontWeight: 700,
                boxShadow: `0 0 12px ${profile.avatarColor}50`,
              }}
            >
              {profile.initials}
            </div>
            <div className="min-w-0">
              <p className="text-white truncate" style={{ fontSize: "13px", fontWeight: 500 }}>
                {profile.displayName}
              </p>
              <p className="truncate" style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>
                @{profile.username}
              </p>
            </div>
          </div>
        </div>
        )}

        {/* Navigation */}
        <nav
          className="flex-1"
          style={{
            display: "flex",
            flexDirection: isMobile ? "row" : "column",
            gap: isMobile ? "4px" : "2px",
            padding: isMobile ? "8px 6px" : "12px",
            overflowX: isMobile ? "auto" : "visible",
          }}
        >
          {NAV_ITEMS.map((item) => {
            const active = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className="flex items-center rounded-xl transition-all"
                style={{
                  fontSize: "13px",
                  fontWeight: active ? 600 : 400,
                  background: active ? "rgba(168, 85, 247, 0.15)" : "transparent",
                  color: active ? "#c084fc" : "rgba(255,255,255,0.45)",
                  borderLeft: !isMobile && active ? "2px solid #a855f7" : "2px solid transparent",
                  borderBottom: isMobile && active ? "2px solid #a855f7" : "2px solid transparent",
                  gap: isTablet ? 0 : "12px",
                  justifyContent: isTablet ? "center" : "flex-start",
                  minWidth: isMobile ? "48px" : undefined,
                  width: isMobile ? "48px" : "100%",
                  padding: isTablet ? "10px" : "10px 12px",
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)";
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)";
                }}
              >
                <item.icon size={15} />
                {!isTablet && item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div
          className="px-3 pb-5 space-y-0.5"
          style={{
            borderTop: isMobile ? "none" : "1px solid rgba(255,255,255,0.05)",
            paddingTop: isMobile ? "0" : "12px",
            paddingBottom: isMobile ? "0" : "20px",
            display: isMobile ? "flex" : "block",
          }}
        >
          <button
            onClick={onViewProfile}
            className="flex items-center rounded-xl transition-all text-left"
            style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", gap: isTablet ? 0 : "12px", justifyContent: isTablet ? "center" : "flex-start", width: isMobile ? "44px" : "100%", padding: isTablet ? "10px" : "10px 12px" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)")}
          >
            <ExternalLink size={14} />
            {!isTablet && "View live page"}
          </button>
          <button
            onClick={onLogout}
            className="flex items-center rounded-xl transition-all text-left"
            style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", gap: isTablet ? 0 : "12px", justifyContent: isTablet ? "center" : "flex-start", width: isMobile ? "44px" : "100%", padding: isTablet ? "10px" : "10px 12px" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#f87171";
              (e.currentTarget as HTMLElement).style.background = "rgba(239, 68, 68, 0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.3)";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <LogOut size={14} />
            {!isTablet && "Sign out"}
          </button>
        </div>
      </aside>

      {/* Main editor area */}
      <div
        className="flex-1 overflow-hidden min-w-0"
        style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: 0 }}
      >
        <div className="flex-1 overflow-y-auto" style={{ minWidth: 0 }}>
          <div className="mx-auto" style={{ maxWidth: "720px", padding: isMobile ? "18px 14px 24px" : "24px" }}>
            {/* Header */}
            <div className="mb-7 flex items-start justify-between gap-3">
              <div>
                <h1 className="text-white" style={{ fontSize: "22px", fontWeight: 700 }}>
                  {currentSection.label}
                </h1>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>
                  {section === "links" && `${links.filter((l) => l.visible).length} of ${links.length} links visible`}
                  {section === "widgets" && `${widgets.filter((w) => w.visible).length} active widgets`}
                  {section === "appearance" && "Customize your page's look and feel"}
                  {section === "analytics" && "Track your page performance"}
                  {section === "profile" && "Manage your identity, avatar, accent, icons, and motion"}
                </p>
              </div>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex shrink-0 items-center gap-2 px-4 py-2 rounded-xl transition-all"
                style={{
                  fontSize: "13px",
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.5)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.9)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)")}
              >
                {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                {showPreview ? "Hide" : "Show"} preview
              </button>
            </div>

            {/* Section content */}
            {section === "profile" && (
              <ProfileEditor profile={profile} theme={theme} onUpdate={onUpdateProfile} onUpdateTheme={onUpdateTheme} />
            )}
            {section === "links" && (
              <LinksManager
                links={links}
                onAdd={onAddLink}
                onUpdate={onUpdateLink}
                onRemove={onRemoveLink}
                onReorder={onReorderLinks}
              />
            )}
            {section === "appearance" && (
              <AppearanceEditor theme={theme} onUpdate={onUpdateTheme} />
            )}
            {section === "analytics" && <AnalyticsDashboard links={links} />}
            {section === "widgets" && (
              <WidgetsPanel
                widgets={widgets}
                onAdd={onAddWidget}
                onUpdate={onUpdateWidget}
                onRemove={onRemoveWidget}
              />
            )}
          </div>
        </div>

        {/* Live preview panel */}
        {showPreview && (
          <div
            className="flex-shrink-0 flex flex-col overflow-hidden"
            style={{
              width: previewPanelWidth,
              maxHeight: isMobile ? "58%" : "none",
              background: "#060610",
              borderLeft: isMobile ? "none" : "1px solid rgba(255,255,255,0.05)",
              borderTop: isMobile ? "1px solid rgba(255,255,255,0.05)" : "none",
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.35)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Live Preview
              </span>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,95,87,0.5)" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,189,46,0.5)" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(40,200,64,0.5)" }} />
              </div>
            </div>

            {/* Phone mockup */}
            <div className="flex-1 overflow-hidden flex items-start justify-center" style={{ padding: isMobile ? "14px" : "20px 16px" }}>
              <div className="relative flex-shrink-0" style={{ width: `${phoneFrameWidth}px` }}>
                {/* Phone notch */}
                <div
                  className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full z-20"
                  style={{ width: `${Math.max(48, phoneFrameWidth * 0.27)}px`, height: "14px", background: "#0a0a16" }}
                />
                {/* Phone frame */}
                <div
                  className="overflow-hidden rounded-[36px]"
                  style={{
                    border: "6px solid #1a1a2e",
                    boxShadow: "0 24px 60px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,255,255,0.05)",
                    height: `${phoneFrameHeight}px`,
                    width: `${phoneFrameWidth}px`,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: "375px",
                      height: "814px",
                      transform: `scale(${phoneScale})`,
                      transformOrigin: "top left",
                      overflow: "hidden",
                    }}
                  >
                    <PublicProfile
                      profile={profile}
                      links={links}
                      theme={theme}
                      widgets={widgets}
                      isPreview={true}
                    />
                  </div>
                </div>
                {/* Home indicator */}
                <div
                  className="mx-auto mt-2 rounded-full"
                  style={{ width: "60px", height: "4px", background: "rgba(255,255,255,0.15)" }}
                />
              </div>
            </div>

            {/* View full link */}
            <div className="px-4 pb-4">
              <button
                onClick={onViewProfile}
                className="w-full py-2.5 rounded-xl text-center transition-all"
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  background: "rgba(168, 85, 247, 0.12)",
                  color: "#c084fc",
                  border: "1px solid rgba(168, 85, 247, 0.2)",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(168, 85, 247, 0.2)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(168, 85, 247, 0.12)")}
              >
                Open full page →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
