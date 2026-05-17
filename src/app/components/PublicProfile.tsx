import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Music,
  Clock,
  BarChart2,
  Mail,
  Youtube,
  Instagram,
  Twitter,
  Github,
  Linkedin,
  Globe,
  MapPin,
  MessageCircle,
  Link as LinkIcon,
  Coffee,
  BookOpen,
  Calendar,
  Camera,
  Code2,
  Gamepad2,
  MailIcon,
  MessageSquare,
  PenLine,
  Phone,
  ShoppingBag,
  Send,
  Tv,
  Headphones,
  Navigation,
  Pause,
  Play,
  Plus,
  Minus,
} from "lucide-react";
import type { UserProfile, LinkItem, ProfileTheme, WidgetItem } from "../App";
import { subscribeWidget, trackClick, voteWidget } from "../backend";
import { MUSIC_TRACK_PRESETS } from "../widgetPlugins";
import { LuffaIcon, SignalIcon, TelegramIcon, ThreemaIcon, ViberIcon, WhatsAppIcon } from "./brandIcons";

interface PublicProfileProps {
  profile: UserProfile;
  links: LinkItem[];
  theme: ProfileTheme;
  widgets: WidgetItem[];
  onBack?: () => void;
  isPreview: boolean;
}

const PLATFORM_CONFIG: Record<string, { icon: React.ComponentType<any>; color: string }> = {
  youtube: { icon: Youtube, color: "#FF0000" },
  instagram: { icon: Instagram, color: "#E1306C" },
  tiktok: { icon: Music, color: "#ffffff" },
  twitter: { icon: Twitter, color: "#1DA1F2" },
  threads: { icon: MessageSquare, color: "#ffffff" },
  github: { icon: Github, color: "#ffffff" },
  gitlab: { icon: Code2, color: "#fc6d26" },
  linkedin: { icon: Linkedin, color: "#0A66C2" },
  spotify: { icon: Headphones, color: "#1DB954" },
  soundcloud: { icon: Music, color: "#ff5500" },
  twitch: { icon: Tv, color: "#9146FF" },
  discord: { icon: Gamepad2, color: "#5865F2" },
  telegram: { icon: TelegramIcon, color: "#2AABEE" },
  signal: { icon: SignalIcon, color: "#3A76F0" },
  threema: { icon: ThreemaIcon, color: "#22c55e" },
  luffa: { icon: LuffaIcon, color: "#7c5cff" },
  viber: { icon: ViberIcon, color: "#7360F2" },
  potato: { icon: MessageSquare, color: "#f59e0b" },
  whatsapp: { icon: WhatsAppIcon, color: "#25D366" },
  writing: { icon: PenLine, color: "#f8fafc" },
  design: { icon: Camera, color: "#ea4c89" },
  figma: { icon: PenLine, color: "#a78bfa" },
  calendar: { icon: Calendar, color: "#38bdf8" },
  notion: { icon: BookOpen, color: "#ffffff" },
  patreon: { icon: Coffee, color: "#ff424d" },
  shop: { icon: ShoppingBag, color: "#22c55e" },
  coffee: { icon: Coffee, color: "#FFDD00" },
  email: { icon: MailIcon, color: "#ec4899" },
  phone: { icon: Phone, color: "#22c55e" },
  website: { icon: Globe, color: "#60a5fa" },
  generic: { icon: LinkIcon, color: "#a78bfa" },
};

function getPlatformConfig(platform: string) {
  return PLATFORM_CONFIG[platform] ?? PLATFORM_CONFIG.generic;
}

function isLinkCurrentlyVisible(link: LinkItem) {
  if (!link.visible) return false;

  const now = new Date();
  if (link.scheduleFrom) {
    const start = new Date(`${link.scheduleFrom}T00:00:00`);
    if (now < start) return false;
  }
  if (link.scheduleTo) {
    const end = new Date(`${link.scheduleTo}T23:59:59`);
    if (now > end) return false;
  }

  const deviceTarget = link.deviceTarget ?? "all";
  if (deviceTarget === "all") return true;
  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  return deviceTarget === "mobile" ? isMobile : !isMobile;
}

function getMusicTrack(config: Record<string, any>) {
  const preset = MUSIC_TRACK_PRESETS.find((track) => track.id === config.trackId);
  if (preset) return preset;
  if (!config.spotifyUrl) return MUSIC_TRACK_PRESETS[0];
  return {
    ...MUSIC_TRACK_PRESETS[0],
    song: config.song ?? MUSIC_TRACK_PRESETS[0].song,
    artist: config.artist ?? MUSIC_TRACK_PRESETS[0].artist,
    spotifyUrl: config.spotifyUrl ?? MUSIC_TRACK_PRESETS[0].spotifyUrl,
  };
}

function youtubeEmbedUrl(url?: string) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");
    const id = host === "youtu.be" ? parsed.pathname.slice(1) : parsed.searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

function spotifyEmbedUrl(value?: string) {
  if (!value) return null;
  const raw = value.trim();
  const supportedTypes = new Set(["track", "album", "playlist", "artist", "episode", "show"]);

  const uriMatch = raw.match(/^spotify:(track|album|playlist|artist|episode|show):([A-Za-z0-9]+)$/);
  if (uriMatch) return `https://open.spotify.com/embed/${uriMatch[1]}/${uriMatch[2]}?utm_source=generator`;

  try {
    const parsed = new URL(raw);
    const parts = parsed.pathname.split("/").filter(Boolean);
    const embedIndex = parts[0] === "embed" ? 1 : 0;
    const type = parts[embedIndex];
    const id = parts[embedIndex + 1];
    if (!supportedTypes.has(type) || !id) return null;
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator`;
  } catch {
    return null;
  }
}

function safeWidgetUrl(value?: string, protocols = ["http:", "https:", "mailto:", "tel:"]) {
  if (!value?.trim()) return null;
  try {
    const parsed = new URL(value.trim());
    return protocols.includes(parsed.protocol) ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function chatHref(value: unknown, message: string) {
  const safeUrl = safeWidgetUrl(typeof value === "string" ? value : undefined);
  if (!safeUrl) return undefined;
  if (!safeUrl.startsWith("mailto:") || !message) return safeUrl;
  const separator = safeUrl.includes("?") ? "&" : "?";
  return `${safeUrl}${separator}subject=LinkFlow message&body=${encodeURIComponent(message)}`;
}

export function PublicProfile({ profile, links, theme, widgets, onBack, isPreview }: PublicProfileProps) {
  const [interactiveWidgets, setInteractiveWidgets] = useState(widgets);

  useEffect(() => {
    setInteractiveWidgets(widgets);
  }, [widgets]);

  const visibleLinks = links.filter(isLinkCurrentlyVisible);
  const visibleWidgets = interactiveWidgets.filter((w) => w.visible);

  const replaceWidget = (updated: WidgetItem) => {
    setInteractiveWidgets((current) => current.map((widget) => (widget.id === updated.id ? updated : widget)));
  };

  const getBackgroundStyle = (): React.CSSProperties => {
    if (theme.backgroundType === "image" && theme.backgroundImage) {
      return {
        backgroundImage: `linear-gradient(rgba(0,0,0,${(theme.backgroundOverlay ?? 45) / 100}), rgba(0,0,0,${(theme.backgroundOverlay ?? 45) / 100})), url(${theme.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }

    switch (theme.backgroundType) {
      case "solid":
        return { background: theme.bgColor1 };
      case "gradient":
        return {
          background: `linear-gradient(160deg, ${theme.bgColor1} 0%, ${theme.bgColor2} 100%)`,
        };
      case "animated":
        return {
          background: `linear-gradient(160deg, ${theme.bgColor1} 0%, ${theme.bgColor2} 100%)`,
        };
      default:
        return { background: theme.bgColor1 };
    }
  };

  const getPatternStyle = (): React.CSSProperties => {
    const pattern = theme.backgroundPattern ?? "grid";
    if (pattern === "none") return {};
    if (pattern === "dots") {
      return {
        backgroundImage: `radial-gradient(${theme.primaryColor}38 1px, transparent 1px)`,
        backgroundSize: isPreview ? "16px 16px" : "22px 22px",
        maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.85), transparent 78%)",
      };
    }
    if (pattern === "stars") {
      return {
        backgroundImage: `radial-gradient(${theme.textColor}70 1px, transparent 1px), radial-gradient(${theme.primaryColor}55 1px, transparent 1px)`,
        backgroundSize: "38px 38px, 64px 64px",
        backgroundPosition: "0 0, 18px 22px",
        maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.75), transparent 82%)",
      };
    }
    if (pattern === "rays") {
      return {
        background: `repeating-conic-gradient(from 0deg at 50% 15%, ${theme.primaryColor}18 0deg 10deg, transparent 10deg 22deg)`,
        maskImage: "radial-gradient(circle at 50% 8%, rgba(0,0,0,0.8), transparent 68%)",
      };
    }
    return {
      backgroundImage: `linear-gradient(${theme.primaryColor}14 1px, transparent 1px), linear-gradient(90deg, ${theme.primaryColor}10 1px, transparent 1px)`,
      backgroundSize: isPreview ? "28px 28px" : "42px 42px",
      maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent 72%)",
    };
  };

  const getProfileMaxWidth = () => {
    if (isPreview) return "min(100%, 343px)";
    if (theme.contentWidth === "compact") return "420px";
    if (theme.contentWidth === "wide") return "560px";
    return "480px";
  };

  const getShellStyle = (): React.CSSProperties => ({
    ...getBackgroundStyle(),
    minHeight: isPreview ? "100%" : "100dvh",
    height: isPreview ? "100%" : undefined,
    width: "100%",
    overflowX: "hidden",
    overflowY: isPreview ? "hidden" : "visible",
    overscrollBehaviorY: isPreview ? "contain" : "auto",
    WebkitOverflowScrolling: "touch",
    fontFamily: `'${theme.fontFamily}', system-ui, sans-serif`,
    boxSizing: "border-box",
    isolation: "isolate",
  });

  const getContentShellStyle = (): React.CSSProperties => ({
    minHeight: isPreview ? "100%" : "100dvh",
    width: "100%",
    boxSizing: "border-box",
    paddingTop: isPreview ? "56px" : "max(28px, calc(env(safe-area-inset-top) + 18px))",
    paddingRight: isPreview ? "14px" : "max(16px, calc(env(safe-area-inset-right) + 16px))",
    paddingBottom: isPreview ? "28px" : "max(40px, calc(env(safe-area-inset-bottom) + 28px))",
    paddingLeft: isPreview ? "14px" : "max(16px, calc(env(safe-area-inset-left) + 16px))",
  });

  const getProfileContentPadding = (): React.CSSProperties => ({
    paddingTop: isPreview ? "0" : onBack ? "34px" : "0",
    paddingRight: "0",
    paddingBottom: "0",
    paddingLeft: "0",
  });

  const getWidgetCardStyle = (widget: WidgetItem): React.CSSProperties => {
    const accentMap: Record<string, string> = {
      music: "#1DB954",
      countdown: "#f59e0b",
      poll: "#3b82f6",
      email: "#ec4899",
      video: "#ef4444",
      product: "#22c55e",
      map: "#f97316",
      chat: "#06b6d4",
    };
    const accent = accentMap[widget.type] ?? theme.primaryColor;
    const base: React.CSSProperties = {
      padding: isPreview ? "10px 12px" : "16px 18px",
      borderRadius: isPreview ? "16px" : "22px",
      position: "relative",
      overflow: "hidden",
    };
    switch (theme.widgetStyle ?? "glass") {
      case "solid":
        return { ...base, background: `linear-gradient(135deg, ${accent}25, rgba(0,0,0,0.28))`, border: `1px solid ${accent}35`, boxShadow: `0 14px 32px rgba(0,0,0,0.22)` };
      case "outline":
        return { ...base, background: "rgba(0,0,0,0.12)", border: `1px solid ${accent}55` };
      case "neon":
        return { ...base, background: "rgba(0,0,0,0.25)", border: `1px solid ${accent}65`, boxShadow: `0 0 24px ${accent}25, inset 0 0 28px ${accent}0f` };
      default:
        return { ...base, background: "rgba(255,255,255,0.09)", border: `1px solid rgba(255,255,255,0.18)`, backdropFilter: "blur(18px)", boxShadow: "0 18px 44px rgba(0,0,0,0.24)" };
    }
  };

  const getLinkStyle = (link: LinkItem): React.CSSProperties => {
    const style = link.buttonStyle ?? theme.buttonStyle;
    const base: React.CSSProperties = {
      color: theme.textColor,
      fontSize: isPreview ? "12px" : "15px",
      fontWeight: 600,
      transition: "all 0.2s ease",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      padding: isPreview ? "9px 12px" : "14px 18px",
      width: "100%",
      minHeight: isPreview ? "42px" : "58px",
      minWidth: 0,
      boxSizing: "border-box",
      textDecoration: "none",
    };

    switch (style) {
      case "pill":
        return { ...base, borderRadius: "999px", background: `${theme.primaryColor}22`, border: `1px solid ${theme.primaryColor}40` };
      case "rounded":
        return { ...base, borderRadius: "12px", background: `${theme.primaryColor}22`, border: `1px solid ${theme.primaryColor}40` };
      case "glass":
        return {
          ...base,
          borderRadius: "14px",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          backdropFilter: "blur(12px)",
        };
      case "3d":
        return {
          ...base,
          borderRadius: "12px",
          background: theme.primaryColor,
          border: "none",
          boxShadow: `0 6px 0 ${theme.primaryColor}66`,
          fontWeight: 600,
        };
      case "neon":
        return {
          ...base,
          borderRadius: "16px",
          background: "rgba(0,0,0,0.22)",
          border: `1px solid ${theme.primaryColor}80`,
          boxShadow: `0 0 22px ${theme.primaryColor}38, inset 0 0 20px ${theme.primaryColor}12`,
          fontWeight: 700,
        };
      case "soft":
        return {
          ...base,
          borderRadius: "18px",
          background: `linear-gradient(135deg, ${theme.primaryColor}22, rgba(255,255,255,0.1))`,
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
        };
      case "brutal":
        return {
          ...base,
          borderRadius: "6px",
          background: theme.textColor,
          color: theme.bgColor1,
          border: `2px solid ${theme.bgColor1}`,
          boxShadow: `5px 5px 0 ${theme.primaryColor}`,
          fontWeight: 900,
        };
      case "underline":
        return {
          ...base,
          borderRadius: 0,
          background: "transparent",
          border: "none",
          borderBottom: `1px solid ${theme.textColor}35`,
          paddingLeft: isPreview ? "4px" : "6px",
          paddingRight: isPreview ? "4px" : "6px",
        };
      default:
        return { ...base, borderRadius: "12px", background: `${theme.primaryColor}22`, border: `1px solid ${theme.primaryColor}40` };
    }
  };

  const getEntrance = (index = 0) => {
    const delay = index * 0.045;
    return {
      initial: { opacity: 0, y: isPreview ? 8 : 16 },
      transition: { duration: 0.32, delay },
    };
  };

  const getHoverMotion = (effect: LinkItem["hoverEffect"]) => {
    if (effect === "expand") return { scale: 1.025 };
    if (effect === "bounce") return { y: -4 };
    if (effect === "glow") return { boxShadow: `0 0 20px ${theme.primaryColor}50` };
    if (effect === "tilt") return { rotate: -1.5, scale: 1.015 };
    if (effect === "slide") return { x: 5 };
    return {};
  };

  const renderLinkIcon = (Icon: React.ComponentType<any>, color: string) => {
    const size = isPreview ? 18 : 25;
    return <Icon size={size} style={{ color, marginRight: isPreview ? "10px" : "14px", flexShrink: 0 }} />;
  };

  const avatarSize = isPreview ? 60 : 96;
  const fontSize = {
    name: isPreview ? "16px" : "clamp(22px, 6vw, 28px)",
    username: isPreview ? "11px" : "14px",
    bio: isPreview ? "11px" : "14px",
  };

  return (
    <div
      className="profile-app-shell relative"
      data-preview={isPreview ? "true" : "false"}
      style={getShellStyle()}
    >
      {/* Animated bg extra glow for 'animated' type */}
      {theme.backgroundType === "animated" && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute"
            style={{
              inset: 0,
              background: `linear-gradient(130deg, ${theme.primaryColor}24, transparent 38%), linear-gradient(230deg, ${theme.textColor}10, transparent 42%)`,
              animation: "pulse 3s ease-in-out infinite",
            }}
          />
        </div>
      )}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute" style={{ inset: 0, ...getPatternStyle() }} />
        <div
          className="absolute"
          style={{
            top: 0,
            left: 0,
            right: 0,
            height: isPreview ? "150px" : "240px",
            background: `linear-gradient(180deg, ${profile.avatarColor}24, transparent)`,
          }}
        />
      </div>

      <main className="profile-safe-shell relative" style={getContentShellStyle()}>
        <div
          className="relative mx-auto flex w-full flex-col items-center"
          style={{
            ...getProfileContentPadding(),
            maxWidth: getProfileMaxWidth(),
          }}
        >
          {/* Back button */}
          {!isPreview && onBack && (
            <button
              onClick={onBack}
              className="absolute left-0 top-0 flex items-center gap-1.5 rounded-full transition-all"
              style={{
                color: `${theme.textColor}70`,
                fontSize: "13px",
                padding: "8px 10px",
                maxWidth: "100%",
                background: "rgba(0,0,0,0.16)",
                border: `1px solid ${theme.textColor}14`,
                backdropFilter: "blur(10px)",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = theme.textColor)}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = `${theme.textColor}70`)}
            >
              <ArrowLeft size={14} /> Dashboard
            </button>
          )}

          {/* Avatar */}
          <motion.div
            initial={getEntrance(0).initial}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            transition={getEntrance(0).transition}
            className="flex min-w-0 flex-col items-center"
            style={{ marginBottom: isPreview ? "16px" : "28px", width: "100%" }}
          >
          <div
            className="rounded-full flex items-center justify-center text-white relative"
            style={{
              width: avatarSize,
              height: avatarSize,
              background: `linear-gradient(135deg, ${profile.avatarColor}, ${theme.primaryColor})`,
              fontSize: isPreview ? "18px" : "28px",
              fontWeight: 700,
              boxShadow: `0 0 ${isPreview ? "20px" : "40px"} ${profile.avatarColor}70, inset 0 0 0 1px rgba(255,255,255,0.22)`,
              marginBottom: isPreview ? "10px" : "16px",
            }}
          >
            <span
              className="absolute rounded-full"
              style={{
                inset: isPreview ? "-5px" : "-8px",
                border: `1px solid ${theme.primaryColor}55`,
                animation: "profileOrbit 7s linear infinite",
              }}
            />
            {profile.initials}
          </div>

          <h1
            className="profile-text-wrap text-center"
            style={{
              fontSize: fontSize.name,
              fontWeight: theme.profileStyle === "poster" ? 900 : 800,
              color: theme.textColor,
              marginBottom: "2px",
              lineHeight: 1.2,
              textTransform: theme.profileStyle === "poster" ? "uppercase" : "none",
              fontFamily: theme.profileStyle === "terminal" ? "JetBrains Mono, monospace" : undefined,
            }}
          >
            {profile.displayName}
          </h1>

          <p style={{ fontSize: fontSize.username, color: `${theme.textColor}60`, marginBottom: "6px" }}>
            {theme.profileStyle === "terminal" ? `~/@${profile.username}` : `@${profile.username}`}
          </p>

          {profile.bio && (
            <p
              className="profile-text-wrap text-center"
              style={{
                fontSize: fontSize.bio,
                color: `${theme.textColor}90`,
                lineHeight: 1.5,
                maxWidth: isPreview ? "200px" : "min(100%, 340px)",
              }}
            >
              {profile.bio}
            </p>
          )}
        </motion.div>

        {/* Links */}
        <div
          className="w-full"
          style={{
            display: theme.layoutMode === "grid" ? "grid" : "flex",
            flexDirection: "column",
            gridTemplateColumns: theme.layoutMode === "grid" ? "repeat(auto-fit, minmax(min(100%, 168px), 1fr))" : undefined,
            gap: isPreview ? "6px" : "10px",
            minWidth: 0,
          }}
        >
          {visibleLinks.map((link, i) => {
            const cfg = getPlatformConfig(link.platform);
            const Icon = cfg.icon;
            return (
              <motion.a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={getEntrance(i + 1).initial}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                transition={getEntrance(i + 1).transition}
                onClick={
                  isPreview
                    ? (e) => e.preventDefault()
                    : () => {
                        void trackClick(link.id);
                      }
                }
                style={getLinkStyle(link)}
                whileHover={getHoverMotion(link.hoverEffect)}
              >
                {renderLinkIcon(Icon, cfg.color)}
                <span className="profile-link-label flex-1 text-center" style={{ marginRight: isPreview ? "13px" : "18px" }}>
                  {link.title}
                </span>
                <ExternalLink size={isPreview ? 11 : 13} style={{ color: `${theme.textColor}40`, flexShrink: 0 }} />
              </motion.a>
            );
          })}
        </div>

        {/* Widgets */}
        {visibleWidgets.length > 0 && (
          <div
            className="w-full"
            style={{ marginTop: isPreview ? "10px" : "16px", display: "flex", flexDirection: "column", gap: isPreview ? "6px" : "10px", minWidth: 0 }}
          >
            {visibleWidgets.map((widget, widgetIndex) => (
              <motion.div
                key={widget.id}
                initial={getEntrance(visibleLinks.length + widgetIndex + 1).initial}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                transition={getEntrance(visibleLinks.length + widgetIndex + 1).transition}
                className="profile-widget-card w-full"
                style={getWidgetCardStyle(widget)}
              >
                <div
                  className="pointer-events-none absolute"
                  style={{
                    top: 0,
                    left: "12%",
                    right: "12%",
                    height: "1px",
                    background: `linear-gradient(90deg, transparent, ${theme.textColor}70, transparent)`,
                  }}
                />
                <WidgetRenderer widget={widget} textColor={theme.textColor} isPreview={isPreview} onWidgetChange={replaceWidget} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: isPreview ? "16px" : "32px", paddingBottom: isPreview ? "0" : "env(safe-area-inset-bottom)" }}>
          <p style={{ fontSize: isPreview ? "9px" : "12px", color: `${theme.textColor}25`, textAlign: "center" }}>
            Made with LinkFlow
          </p>
        </div>
      </div>
      </main>
    </div>
  );
}

function WidgetRenderer({
  widget,
  textColor,
  isPreview,
  onWidgetChange,
}: {
  widget: WidgetItem;
  textColor: string;
  isPreview: boolean;
  onWidgetChange: (widget: WidgetItem) => void;
}) {
  const size = isPreview ? "10px" : "13px";
  const titleSize = isPreview ? "12px" : "15px";
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(widget.config.trackId ?? null);
  const [levels, setLevels] = useState([22, 38, 54, 44, 70, 48, 34, 62, 40, 26]);
  const [expandedVideo, setExpandedVideo] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [chatText, setChatText] = useState("");
  const [sentChat, setSentChat] = useState(false);
  const [now, setNow] = useState(Date.now());
  const audioRef = useRef<{
    context: AudioContext;
    analyser: AnalyserNode;
    gain: GainNode;
    timers: number[];
    frame: number;
  } | null>(null);

  const stopMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.timers.forEach((timer) => window.clearTimeout(timer));
    window.cancelAnimationFrame(audio.frame);
    audio.gain.gain.setTargetAtTime(0, audio.context.currentTime, 0.04);
    window.setTimeout(() => {
      void audio.context.close();
    }, 180);
    audioRef.current = null;
    setIsMusicPlaying(false);
  };

  useEffect(() => stopMusic, []);

  useEffect(() => {
    if (widget.type !== "countdown") return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [widget.type]);

  const playMusic = async (trackId?: string) => {
    stopMusic();
    const track = MUSIC_TRACK_PRESETS.find((item) => item.id === trackId) ?? getMusicTrack(widget.config);
    const AudioContextCtor = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!AudioContextCtor) return;

    const context = new AudioContextCtor() as AudioContext;
    const analyser = context.createAnalyser();
    const gain = context.createGain();
    analyser.fftSize = 64;
    gain.gain.value = 0.12;
    analyser.connect(gain);
    gain.connect(context.destination);

    const beatMs = 60000 / track.bpm;
    const timers: number[] = [];
    const scheduleNote = (delay: number, frequency: number, duration: number, volume: number, type: OscillatorType) => {
      const timer = window.setTimeout(() => {
        const oscillator = context.createOscillator();
        const noteGain = context.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, context.currentTime);
        noteGain.gain.setValueAtTime(volume, context.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
        oscillator.connect(noteGain);
        noteGain.connect(analyser);
        oscillator.start();
        oscillator.stop(context.currentTime + duration);
      }, delay);
      timers.push(timer);
    };

    for (let bar = 0; bar < 16; bar += 1) {
      const offset = bar * beatMs;
      scheduleNote(offset, track.bass, 0.18, 0.85, "sine");
      scheduleNote(offset + beatMs * 0.5, track.lead, 0.08, 0.24, "triangle");
      scheduleNote(offset + beatMs * 1.0, track.bass * 1.5, 0.12, 0.38, "square");
      scheduleNote(offset + beatMs * 1.5, track.lead * 1.25, 0.07, 0.2, "triangle");
    }

    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      setLevels(Array.from({ length: 10 }, (_, index) => 18 + Math.min(72, data[index + 2] / 2.6)));
      audioRef.current!.frame = window.requestAnimationFrame(tick);
    };

    audioRef.current = { context, analyser, gain, timers, frame: window.requestAnimationFrame(tick) };
    setSelectedTrackId(track.id);
    setIsMusicPlaying(true);
    timers.push(window.setTimeout(stopMusic, beatMs * 16 + 500));
    await context.resume();
  };

  const handleVote = async (optionIndex: number) => {
    if (isPreview) {
      const votes = [...(widget.config.votes ?? [0, 0])];
      votes[optionIndex] = (Number(votes[optionIndex]) || 0) + 1;
      onWidgetChange({ ...widget, config: { ...widget.config, votes } });
      return;
    }
    const updated = await voteWidget(widget.id, optionIndex);
    onWidgetChange(updated);
  };

  const handleSubscribe = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("Enter a valid email");
      return;
    }
    if (isPreview) {
      setEmail("");
      setMessage("Preview subscribed");
      return;
    }
    const updated = await subscribeWidget(widget.id, email);
    onWidgetChange(updated);
    setEmail("");
    setMessage("Subscribed");
  };

  switch (widget.type) {
    case "music": {
      const track = MUSIC_TRACK_PRESETS.find((item) => item.id === selectedTrackId) ?? getMusicTrack(widget.config);
      const embedUrl = spotifyEmbedUrl(widget.config.spotifyUrl ?? track.spotifyUrl);
      if (embedUrl) {
        return (
          <div>
            <div className="profile-widget-adaptive mb-3 flex items-center gap-3">
              <div
                className="rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  width: isPreview ? "34px" : "42px",
                  height: isPreview ? "34px" : "42px",
                  background: "#1DB95422",
                  border: "1px solid #1DB95445",
                  color: "#1DB954",
                }}
              >
                <Headphones size={isPreview ? 15 : 20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="profile-widget-title" style={{ fontSize: titleSize, fontWeight: 800, color: textColor }}>
                  {widget.config.song ?? track.song}
                </p>
                <p className="profile-widget-copy" style={{ fontSize: size, color: `${textColor}60` }}>
                  {widget.config.artist ?? track.artist} · Spotify
                </p>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl" style={{ background: "rgba(0,0,0,0.2)", height: isPreview ? "92px" : "152px" }}>
              <iframe
                title={`${widget.config.song ?? track.song} Spotify player`}
                src={embedUrl}
                width="100%"
                height="100%"
                className="border-0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </div>
          </div>
        );
      }
      return (
        <div>
          <div className="profile-widget-adaptive flex items-center gap-3">
            <button
              onClick={() => (isMusicPlaying ? stopMusic() : void playMusic(track.id))}
              className="rounded-xl flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105"
              style={{
                width: isPreview ? "34px" : "48px",
                height: isPreview ? "34px" : "48px",
                background: `${track.color}22`,
                border: `1px solid ${track.color}45`,
                color: track.color,
              }}
            >
              {isMusicPlaying ? <Pause size={isPreview ? 14 : 20} /> : <Play size={isPreview ? 14 : 20} />}
            </button>
            <div className="min-w-0 flex-1">
              <p className="profile-widget-title" style={{ fontSize: titleSize, fontWeight: 700, color: textColor }}>
                {track.song}
              </p>
              <p className="profile-widget-copy" style={{ fontSize: size, color: `${textColor}60` }}>
                {track.artist} · {track.bpm} BPM
              </p>
            </div>
            <div className="flex gap-1 items-end flex-shrink-0" style={{ height: isPreview ? "28px" : "42px" }}>
              {levels.map((h, i) => (
                <div
                  key={i}
                  className="rounded-full"
                  style={{
                    width: isPreview ? "3px" : "4px",
                    height: `${Math.max(isPreview ? 6 : 10, h * (isPreview ? 0.34 : 0.52))}px`,
                    background: `linear-gradient(to top, ${track.color}, ${textColor})`,
                    opacity: isMusicPlaying || isPreview ? 0.85 : 0.35,
                    transition: "height 80ms linear",
                    animation: isMusicPlaying ? undefined : `pulse ${0.7 + i * 0.08}s ease-in-out infinite alternate`,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="profile-widget-auto-grid mt-3 grid grid-cols-2 gap-2">
              {MUSIC_TRACK_PRESETS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => void playMusic(item.id)}
                  className="rounded-xl px-3 py-2 text-left transition-all"
                  style={{
                    border: `1px solid ${selectedTrackId === item.id ? item.color : `${textColor}18`}`,
                    background: selectedTrackId === item.id ? `${item.color}18` : "rgba(255,255,255,0.045)",
                    color: textColor,
                    fontSize: "12px",
                  }}
                >
                  <span className="block truncate" style={{ fontWeight: 700 }}>{item.song}</span>
                  <span style={{ color: `${textColor}55`, fontSize: "10px" }}>{item.bpm} BPM</span>
                </button>
              ))}
          </div>
        </div>
      );
    }

    case "countdown": {
      const target = new Date(`${widget.config.targetDate ?? ""}T23:59:59`);
      const targetTime = Number.isFinite(target.getTime()) ? target.getTime() : now;
      const diff = Math.max(0, targetTime - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      const units = [
        ["days", days],
        ["hrs", hours],
        ["min", minutes],
        ["sec", seconds],
      ];
      return (
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock size={isPreview ? 10 : 14} style={{ color: `${textColor}60` }} />
            <p style={{ fontSize: size, color: `${textColor}60` }}>{widget.config.label}</p>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {units.map(([label, value]) => (
              <div key={label} className="rounded-xl" style={{ background: `${textColor}0d`, padding: isPreview ? "5px 2px" : "9px 4px" }}>
                <p style={{ fontSize: isPreview ? "15px" : "26px", fontWeight: 800, color: textColor, lineHeight: 1 }}>
                  {String(value).padStart(label === "days" ? 1 : 2, "0")}
                </p>
                <p style={{ fontSize: isPreview ? "7px" : "10px", color: `${textColor}50` }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "poll": {
      const options = widget.config.options ?? ["Option A", "Option B"];
      const votes = widget.config.votes ?? [60, 40];
      const totalVotes = votes.reduce((sum: number, vote: number) => sum + Number(vote || 0), 0) || 1;
      return (
        <div>
          <p className="profile-widget-title" style={{ fontSize: titleSize, fontWeight: 600, color: textColor, marginBottom: "8px" }}>
            {widget.config.question ?? "Quick Poll"}
          </p>
          <div className="space-y-1.5">
            {options.map((opt: string, i: number) => (
              <button
                key={i}
                onClick={() => handleVote(i)}
                className="block w-full text-left rounded-lg"
                style={{ padding: isPreview ? "3px 0" : "6px 0", cursor: "pointer" }}
              >
                <div className="flex justify-between mb-0.5">
                  <span style={{ fontSize: size, color: textColor }}>{opt}</span>
                  <span style={{ fontSize: size, color: `${textColor}60` }}>{Math.round((Number(votes[i] || 0) / totalVotes) * 100)}%</span>
                </div>
                <div className="rounded-full overflow-hidden" style={{ height: isPreview ? "3px" : "5px", background: `${textColor}15` }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.round((Number(votes[i] || 0) / totalVotes) * 100)}%`, background: textColor, opacity: 0.6, transition: "width 250ms ease" }}
                  />
                </div>
              </button>
            ))}
          </div>
          <p style={{ marginTop: "7px", fontSize: isPreview ? "9px" : "11px", color: `${textColor}45` }}>
              {totalVotes} votes · tap to vote live
          </p>
        </div>
      );
    }

    case "email": {
      return (
        <div className="profile-widget-adaptive profile-widget-email flex items-center gap-3 relative">
          <Mail size={isPreview ? 14 : 20} style={{ color: `${textColor}70`, flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <p className="profile-widget-title" style={{ fontSize: titleSize, fontWeight: 600, color: textColor }}>
              {widget.config.label ?? "Subscribe for updates"}
            </p>
            <p className="profile-widget-copy" style={{ fontSize: size, color: `${textColor}50` }}>Join {widget.config.count ?? "1,200+"} subscribers</p>
          </div>
          <div className={`${isPreview ? "mt-2 flex w-full items-center gap-1.5" : "flex items-center gap-2 flex-shrink-0"} profile-widget-form`}>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@email.com"
                className="profile-widget-input rounded-full px-3 py-2 text-white outline-none"
                style={{ width: isPreview ? "100%" : "150px", minWidth: 0, background: "rgba(255,255,255,0.1)", border: `1px solid ${textColor}20`, fontSize: isPreview ? "10px" : "12px" }}
              />
              <button
                onClick={handleSubscribe}
                className="profile-widget-action px-4 py-2 rounded-full text-white flex-shrink-0"
                style={{ background: "#25d0b2", color: "#07100e", fontSize: isPreview ? "10px" : "13px", fontWeight: 700 }}
              >
                {message === "Subscribed" ? <Check size={15} /> : "Join"}
              </button>
          </div>
          {message && (
            <p className="profile-widget-message" style={{ position: isPreview ? "static" : "absolute", right: "20px", bottom: "5px", marginTop: isPreview ? "4px" : undefined, fontSize: isPreview ? "9px" : "11px", color: `${textColor}70` }}>{message}</p>
          )}
        </div>
      );
    }

    case "video": {
      const embedUrl = youtubeEmbedUrl(widget.config.url);
      return (
        <div>
          <button
            onClick={() => setExpandedVideo((value) => !value)}
            className="profile-widget-adaptive flex items-center gap-3 w-full text-left"
            style={{ cursor: "pointer" }}
          >
            <div
              className="rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ width: isPreview ? "40px" : "64px", height: isPreview ? "24px" : "40px", background: "#FF000025" }}
            >
              {expandedVideo ? <Pause size={isPreview ? 12 : 18} style={{ color: "#FF0000" }} /> : <Youtube size={isPreview ? 12 : 18} style={{ color: "#FF0000" }} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="profile-widget-title" style={{ fontSize: titleSize, fontWeight: 700, color: textColor }}>
                {widget.config.title ?? "Latest Video"}
              </p>
              <p className="profile-widget-copy" style={{ fontSize: size, color: `${textColor}50` }}>
                {widget.config.views ?? "12K"} views · {expandedVideo ? "playing preview" : "tap to preview"}
              </p>
            </div>
          </button>
          {expandedVideo && (
            <div className="mt-3 overflow-hidden rounded-xl" style={{ aspectRatio: "16 / 9", background: "rgba(0,0,0,0.35)" }}>
              {embedUrl && !isPreview ? (
                <iframe title={widget.config.title ?? "Video"} src={embedUrl} className="size-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              ) : (
                <div className="size-full flex items-center justify-center gap-2" style={{ color: textColor, fontSize: isPreview ? "10px" : "13px", textDecoration: "none" }}>
                  Preview playing <Play size={isPreview ? 11 : 14} />
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    case "product": {
      const priceValue = String(widget.config.price ?? "$29");
      const accent = "#22c55e";
      const productUrl = safeWidgetUrl(widget.config.url);
      return (
        <div>
          <div className="profile-widget-adaptive flex items-start gap-3">
            <div
              className="rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                width: isPreview ? "34px" : "46px",
                height: isPreview ? "34px" : "46px",
                background: "rgba(34,197,94,0.18)",
              }}
            >
              <ShoppingBag size={isPreview ? 15 : 21} style={{ color: accent }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="profile-widget-heading-row flex items-start justify-between gap-2">
                <p className="profile-widget-title" style={{ fontSize: titleSize, fontWeight: 700, color: textColor }}>
                  {widget.config.name ?? "Featured Product"}
                </p>
                <p style={{ fontSize: titleSize, fontWeight: 800, color: accent, flexShrink: 0 }}>
                  {priceValue}
                </p>
              </div>
              <p className="profile-widget-copy" style={{ fontSize: size, color: `${textColor}65`, lineHeight: 1.45, marginTop: "3px" }}>
                {widget.config.description ?? "Featured offer"}
              </p>
              <div className="profile-widget-form mt-3 flex items-center justify-between gap-3">
                  <div className="flex items-center rounded-full" style={{ background: `${textColor}0d`, border: `1px solid ${textColor}18` }}>
                    <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="p-2" style={{ color: textColor }}><Minus size={13} /></button>
                    <span style={{ minWidth: "26px", textAlign: "center", color: textColor, fontSize: "13px", fontWeight: 700 }}>{quantity}</span>
                    <button onClick={() => setQuantity((value) => value + 1)} className="p-2" style={{ color: textColor }}><Plus size={13} /></button>
                  </div>
                  {!isPreview && <span style={{ fontSize: "11px", color: `${textColor}50` }}>Instant checkout preview</span>}
                </div>
            </div>
          </div>
          {!isPreview && (
            <a
              href={productUrl ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 rounded-full text-white"
              style={{ background: accent, padding: "9px 14px", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}
            >
              {widget.config.buttonLabel ?? "View product"} · {quantity} <ExternalLink size={13} />
            </a>
          )}
        </div>
      );
    }

    case "map": {
      const mapUrl = safeWidgetUrl(widget.config.url, ["http:", "https:"]);
      return (
        <div>
          <div className="profile-widget-adaptive flex items-center gap-3">
            <div
              className="rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                width: isPreview ? "34px" : "46px",
                height: isPreview ? "34px" : "46px",
                background: "rgba(249,115,22,0.18)",
              }}
            >
              <MapPin size={isPreview ? 15 : 21} style={{ color: "#f97316" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="profile-widget-title" style={{ fontSize: titleSize, fontWeight: 700, color: textColor }}>
                {widget.config.place ?? "Location"}
              </p>
              <p className="profile-widget-copy" style={{ fontSize: size, color: `${textColor}60`, lineHeight: 1.4 }}>
                {widget.config.address ?? "Address"}
              </p>
            </div>
            {!isPreview && (
              <a
                href={mapUrl ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full flex items-center gap-1.5"
                style={{ color: textColor, border: `1px solid ${textColor}25`, padding: "7px 10px", fontSize: "12px", textDecoration: "none" }}
              >
                <Navigation size={12} /> Route
              </a>
            )}
          </div>
          <div className="mt-3 rounded-xl overflow-hidden relative" style={{ height: isPreview ? "56px" : "92px", background: "linear-gradient(135deg, rgba(249,115,22,0.22), rgba(59,130,246,0.14))" }}>
              <div className="absolute" style={{ inset: "18px 0 auto 0", height: "2px", background: `${textColor}20`, transform: "rotate(-8deg)" }} />
              <div className="absolute" style={{ inset: "54px 0 auto 0", height: "2px", background: `${textColor}18`, transform: "rotate(11deg)" }} />
              <div className="absolute rounded-full" style={{ left: "54%", top: "32px", width: "20px", height: "20px", background: "#f97316", boxShadow: "0 0 0 8px rgba(249,115,22,0.18)" }} />
              <p style={{ position: "absolute", left: "14px", bottom: "10px", color: `${textColor}70`, fontSize: isPreview ? "9px" : "11px" }}>Live venue card</p>
            </div>
        </div>
      );
    }

    case "chat": {
      const messageHref = chatHref(widget.config.url, chatText);
      return (
        <div className="profile-widget-adaptive profile-widget-chat flex items-start gap-3">
          <div
            className="rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              width: isPreview ? "34px" : "46px",
              height: isPreview ? "34px" : "46px",
              background: "rgba(6,182,212,0.18)",
            }}
          >
            <MessageCircle size={isPreview ? 15 : 21} style={{ color: "#06b6d4" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="profile-widget-title" style={{ fontSize: titleSize, fontWeight: 700, color: textColor }}>
              {widget.config.headline ?? "Have a question?"}
            </p>
            <p className="profile-widget-copy" style={{ fontSize: size, color: `${textColor}60`, lineHeight: 1.4, marginTop: "2px" }}>
              {widget.config.message ?? "Send me a quick message."}
            </p>
              <div className="profile-widget-form mt-3 flex gap-2">
                <input
                  value={chatText}
                  onChange={(event) => {
                    setChatText(event.target.value);
                    setSentChat(false);
                  }}
                  placeholder="Type a quick message"
                  className="profile-widget-input min-w-0 flex-1 rounded-full px-3 py-2 outline-none"
                  style={{ background: `${textColor}0d`, border: `1px solid ${textColor}18`, color: textColor, fontSize: isPreview ? "10px" : "12px" }}
                />
                <a
                  href={isPreview ? undefined : messageHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => {
                    if (isPreview || !messageHref) event.preventDefault();
                    setSentChat(true);
                  }}
                  className="profile-widget-action inline-flex items-center justify-center rounded-full text-white"
                  style={{ width: isPreview ? "30px" : "36px", height: isPreview ? "30px" : "36px", background: sentChat ? "#22c55e" : "#06b6d4", textDecoration: "none" }}
                >
                  {sentChat ? <Check size={15} /> : <Send size={15} />}
                </a>
              </div>
          </div>
        </div>
      );
    }

    default:
      return (
        <div style={{ fontSize: size, color: `${textColor}70` }}>
          <BarChart2 size={isPreview ? 12 : 16} style={{ display: "inline-block", marginRight: "6px" }} />
          {widget.title}
        </div>
      );
  }
}
