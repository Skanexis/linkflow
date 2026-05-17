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

const DASH_THEME = {
  bg: "#0b100f",
  sidebar: "#0f1614",
  panel: "#111916",
  panelSoft: "rgba(246, 242, 232, 0.055)",
  border: "rgba(246, 242, 232, 0.1)",
  text: "#f6f2e8",
  muted: "rgba(246, 242, 232, 0.58)",
  soft: "rgba(246, 242, 232, 0.34)",
  teal: "#25d0b2",
  amber: "#f5b84b",
  coral: "#ff7a59",
};

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
        background: DASH_THEME.bg,
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
          background: DASH_THEME.sidebar,
          borderRight: isMobile ? "none" : `1px solid ${DASH_THEME.border}`,
          borderBottom: isMobile ? `1px solid ${DASH_THEME.border}` : "none",
          display: "flex",
          flexDirection: isMobile ? "row" : "column",
          alignItems: isMobile ? "center" : "stretch",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2 px-5 py-5"
          style={{
            borderBottom: isMobile ? "none" : `1px solid ${DASH_THEME.border}`,
            padding: isTablet ? "14px" : "20px",
            justifyContent: isTablet && !isMobile ? "center" : "flex-start",
          }}
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: `linear-gradient(135deg, ${DASH_THEME.teal}, ${DASH_THEME.amber})`, color: "#07100e", boxShadow: "0 10px 28px rgba(37,208,178,0.16)" }}
          >
            <Sparkles size={14} />
          </div>
          <span style={{ color: DASH_THEME.text, fontWeight: 800, fontSize: "16px", display: isTablet ? "none" : "inline" }}>
            LinkFlow
          </span>
        </div>

        {/* Profile mini */}
        {!isTablet && (
        <div className="px-4 py-4" style={{ borderBottom: `1px solid ${DASH_THEME.border}` }}>
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
              <p className="truncate" style={{ color: DASH_THEME.text, fontSize: "13px", fontWeight: 700 }}>
                {profile.displayName}
              </p>
              <p className="truncate" style={{ fontSize: "11px", color: DASH_THEME.soft }}>
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
                  background: active ? "rgba(37, 208, 178, 0.12)" : "transparent",
                  color: active ? "#99f6e4" : DASH_THEME.muted,
                  borderLeft: !isMobile && active ? `2px solid ${DASH_THEME.teal}` : "2px solid transparent",
                  borderBottom: isMobile && active ? `2px solid ${DASH_THEME.teal}` : "2px solid transparent",
                  gap: isTablet ? 0 : "12px",
                  justifyContent: isTablet ? "center" : "flex-start",
                  minWidth: isMobile ? "48px" : undefined,
                  width: isMobile ? "48px" : "100%",
                  padding: isTablet ? "10px" : "10px 12px",
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.color = DASH_THEME.text;
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.color = DASH_THEME.muted;
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
            borderTop: isMobile ? "none" : `1px solid ${DASH_THEME.border}`,
            paddingTop: isMobile ? "0" : "12px",
            paddingBottom: isMobile ? "0" : "20px",
            display: isMobile ? "flex" : "block",
          }}
        >
          <button
            onClick={onViewProfile}
            className="flex items-center rounded-xl transition-all text-left"
            style={{ fontSize: "13px", color: DASH_THEME.muted, gap: isTablet ? 0 : "12px", justifyContent: isTablet ? "center" : "flex-start", width: isMobile ? "44px" : "100%", padding: isTablet ? "10px" : "10px 12px" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = DASH_THEME.text)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = DASH_THEME.muted)}
          >
            <ExternalLink size={14} />
            {!isTablet && "View live page"}
          </button>
          <button
            onClick={onLogout}
            className="flex items-center rounded-xl transition-all text-left"
            style={{ fontSize: "13px", color: DASH_THEME.soft, gap: isTablet ? 0 : "12px", justifyContent: isTablet ? "center" : "flex-start", width: isMobile ? "44px" : "100%", padding: isTablet ? "10px" : "10px 12px" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = DASH_THEME.coral;
              (e.currentTarget as HTMLElement).style.background = "rgba(255, 122, 89, 0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = DASH_THEME.soft;
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
                <h1 style={{ color: DASH_THEME.text, fontSize: "22px", fontWeight: 900 }}>
                  {currentSection.label}
                </h1>
                <p style={{ fontSize: "13px", color: DASH_THEME.soft, marginTop: "2px" }}>
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
                  background: DASH_THEME.panelSoft,
                  color: DASH_THEME.muted,
                  border: `1px solid ${DASH_THEME.border}`,
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = DASH_THEME.text)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = DASH_THEME.muted)}
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
              background: "#0a0f0e",
              borderLeft: isMobile ? "none" : `1px solid ${DASH_THEME.border}`,
              borderTop: isMobile ? `1px solid ${DASH_THEME.border}` : "none",
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: `1px solid ${DASH_THEME.border}` }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: DASH_THEME.soft,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Live Preview
              </span>
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: `${DASH_THEME.coral}99` }} />
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: `${DASH_THEME.amber}99` }} />
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: `${DASH_THEME.teal}99` }} />
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
                    border: "6px solid #17201d",
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
                  style={{ width: "60px", height: "4px", background: "rgba(246,242,232,0.16)" }}
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
                  background: "rgba(37, 208, 178, 0.12)",
                  color: "#99f6e4",
                  border: "1px solid rgba(37, 208, 178, 0.24)",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(37, 208, 178, 0.18)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(37, 208, 178, 0.12)")}
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
