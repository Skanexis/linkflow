import { useState, useRef } from "react";
import {
  Plus,
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Globe,
  Youtube,
  Instagram,
  Twitter,
  Github,
  Linkedin,
  Headphones,
  Coffee,
  Link as LinkIcon,
  Tv,
  BookOpen,
  Calendar,
  Camera,
  Code2,
  Gamepad2,
  Mail,
  MessageCircle,
  MessageSquare,
  Music,
  PenLine,
  Phone,
  ShieldCheck,
  Send,
  ShoppingBag,
} from "lucide-react";
import type { LinkItem } from "../App";

const PLATFORM_ICONS: Record<string, { icon: React.ComponentType<any>; color: string; label: string }> = {
  youtube: { icon: Youtube, color: "#FF0000", label: "YouTube" },
  instagram: { icon: Instagram, color: "#E1306C", label: "Instagram" },
  tiktok: { icon: Music, color: "#ffffff", label: "TikTok" },
  twitter: { icon: Twitter, color: "#1DA1F2", label: "Twitter / X" },
  threads: { icon: MessageSquare, color: "#ffffff", label: "Threads" },
  github: { icon: Github, color: "#ffffff", label: "GitHub" },
  gitlab: { icon: Code2, color: "#fc6d26", label: "GitLab" },
  linkedin: { icon: Linkedin, color: "#0A66C2", label: "LinkedIn" },
  spotify: { icon: Headphones, color: "#1DB954", label: "Spotify" },
  soundcloud: { icon: Music, color: "#ff5500", label: "SoundCloud" },
  twitch: { icon: Tv, color: "#9146FF", label: "Twitch" },
  discord: { icon: Gamepad2, color: "#5865F2", label: "Discord" },
  telegram: { icon: Send, color: "#2AABEE", label: "Telegram" },
  signal: { icon: ShieldCheck, color: "#3A76F0", label: "Signal" },
  threema: { icon: ShieldCheck, color: "#22c55e", label: "Threema" },
  potato: { icon: MessageSquare, color: "#f59e0b", label: "Potato" },
  whatsapp: { icon: MessageCircle, color: "#25D366", label: "WhatsApp" },
  writing: { icon: PenLine, color: "#f8fafc", label: "Blog / Writing" },
  design: { icon: Camera, color: "#ea4c89", label: "Design Portfolio" },
  figma: { icon: PenLine, color: "#a78bfa", label: "Figma" },
  calendar: { icon: Calendar, color: "#38bdf8", label: "Booking" },
  notion: { icon: BookOpen, color: "#ffffff", label: "Notion" },
  patreon: { icon: Coffee, color: "#ff424d", label: "Patreon" },
  shop: { icon: ShoppingBag, color: "#22c55e", label: "Shop" },
  coffee: { icon: Coffee, color: "#FFDD00", label: "Buy Me a Coffee" },
  email: { icon: Mail, color: "#ec4899", label: "Email" },
  phone: { icon: Phone, color: "#22c55e", label: "Phone" },
  website: { icon: Globe, color: "#60a5fa", label: "Website" },
  generic: { icon: LinkIcon, color: "#a78bfa", label: "Link" },
};

function detectPlatform(url: string): string {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("tiktok.com")) return "tiktok";
  if (u.includes("twitter.com") || u.includes("x.com")) return "twitter";
  if (u.includes("threads.net")) return "threads";
  if (u.includes("github.com")) return "github";
  if (u.includes("gitlab.com")) return "gitlab";
  if (u.includes("linkedin.com")) return "linkedin";
  if (u.includes("spotify.com")) return "spotify";
  if (u.includes("soundcloud.com")) return "soundcloud";
  if (u.includes("twitch.tv")) return "twitch";
  if (u.includes("discord.gg") || u.includes("discord.com")) return "discord";
  if (u.includes("telegram.me") || u.includes("t.me") || u.includes("telegram.dog")) return "telegram";
  if (u.includes("signal.me") || u.includes("signal.group") || u.startsWith("sgnl://")) return "signal";
  if (u.includes("threema.id") || u.includes("threema.ch") || u.startsWith("threema://")) return "threema";
  if (u.includes("potato.im") || u.includes("pt.im") || u.startsWith("potato://")) return "potato";
  if (u.includes("wa.me") || u.includes("whatsapp.com")) return "whatsapp";
  if (u.includes("medium.com") || u.includes("substack.com")) return "writing";
  if (u.includes("behance.net") || u.includes("dribbble.com")) return "design";
  if (u.includes("figma.com")) return "figma";
  if (u.includes("cal.com") || u.includes("calendly.com")) return "calendar";
  if (u.includes("notion.site") || u.includes("notion.so")) return "notion";
  if (u.includes("patreon.com")) return "patreon";
  if (u.includes("gumroad.com") || u.includes("lemonsqueezy.com") || u.includes("shopify.com")) return "shop";
  if (u.includes("buymeacoffee.com") || u.includes("ko-fi.com")) return "coffee";
  if (u.startsWith("mailto:")) return "email";
  if (u.startsWith("tel:")) return "phone";
  if (/https?:\/\/.+/.test(u)) return "website";
  return "generic";
}

const BUTTON_STYLES: LinkItem["buttonStyle"][] = ["pill", "rounded", "glass", "3d", "neon", "soft", "brutal", "underline"];
const HOVER_EFFECTS: LinkItem["hoverEffect"][] = ["none", "glow", "bounce", "expand", "tilt", "slide"];
const QUICK_LINKS = [
  { label: "Email", url: "mailto:hello@example.com" },
  { label: "WhatsApp", url: "https://wa.me/15551234567" },
  { label: "Booking", url: "https://cal.com/yourname" },
  { label: "Shop", url: "https://gumroad.com/yourname" },
  { label: "Telegram", url: "https://t.me/yourname" },
  { label: "Signal", url: "https://signal.me/#eu/your-id" },
  { label: "Threema", url: "https://threema.id/YOURID" },
  { label: "Portfolio", url: "https://yourname.com" },
];

interface LinksManagerProps {
  links: LinkItem[];
  onAdd: (l: Omit<LinkItem, "id">) => void;
  onUpdate: (id: string, u: Partial<LinkItem>) => void;
  onRemove: (id: string) => void;
  onReorder: (from: number, to: number) => void;
}

interface AddLinkForm {
  title: string;
  url: string;
}

export function LinksManager({ links, onAdd, onUpdate, onRemove, onReorder }: LinksManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<AddLinkForm>({ title: "", url: "" });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<Partial<AddLinkForm>>({});

  const detectedPlatform = detectPlatform(form.url);

  const validateForm = () => {
    const errs: Partial<AddLinkForm> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.url.trim()) {
      errs.url = "URL is required";
    } else if (!/^(https?:\/\/|mailto:|tel:).+/.test(form.url)) {
      errs.url = "Enter a valid URL, mailto:, or tel:";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAdd = () => {
    if (!validateForm()) return;
    onAdd({
      title: form.title.trim(),
      url: form.url.trim(),
      visible: true,
      platform: detectedPlatform,
      buttonStyle: "pill",
      hoverEffect: "glow",
      deviceTarget: "all",
    });
    setForm({ title: "", url: "" });
    setShowAddForm(false);
    setErrors({});
  };

  const handleUrlChange = (url: string) => {
    setForm((f) => ({ ...f, url }));
    const platform = detectPlatform(url);
    if (!form.title && platform !== "generic" && platform !== "website") {
      const cfg = PLATFORM_ICONS[platform];
      if (cfg) setForm((f) => ({ ...f, url, title: cfg.label }));
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) {
      onReorder(dragIndex, index);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Add link button */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed transition-all"
          style={{
            borderColor: "rgba(168, 85, 247, 0.3)",
            color: "rgba(168, 85, 247, 0.7)",
            fontSize: "14px",
            fontWeight: 500,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(168, 85, 247, 0.6)";
            (e.currentTarget as HTMLElement).style.background = "rgba(168, 85, 247, 0.05)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(168, 85, 247, 0.3)";
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          <Plus size={16} />
          Add new link
        </button>
      ) : (
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ background: "rgba(168, 85, 247, 0.06)", border: "1px solid rgba(168, 85, 247, 0.2)" }}
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-white" style={{ fontSize: "14px", fontWeight: 600 }}>
              New Link
            </h3>
            <div className="flex flex-wrap justify-end gap-1.5">
              {QUICK_LINKS.map((quick) => (
                <button
                  key={quick.label}
                  onClick={() => handleUrlChange(quick.url)}
                  className="rounded-full px-2.5 py-1 transition-all hover:bg-white/10"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.52)", fontSize: "10px" }}
                >
                  {quick.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "6px" }}>
              URL
            </label>
            <div className="relative">
              <input
                value={form.url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com, mailto:you@email.com, tel:+15551234567"
                className="w-full rounded-xl px-4 py-2.5 text-white outline-none placeholder-white/20 pr-10"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: errors.url ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)",
                  fontSize: "14px",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#a855f7")}
                onBlur={(e) => (e.target.style.borderColor = errors.url ? "#ef4444" : "rgba(255,255,255,0.1)")}
              />
              {form.url && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {(() => {
                    const cfg = PLATFORM_ICONS[detectedPlatform];
                    if (!cfg) return null;
                    const Icon = cfg.icon;
                    return <Icon size={15} style={{ color: cfg.color }} />;
                  })()}
                </div>
              )}
            </div>
            {errors.url && <p className="text-red-400 mt-1" style={{ fontSize: "11px" }}>{errors.url}</p>}
            {form.url && detectedPlatform !== "generic" && (
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "4px" }}>
                Detected: {PLATFORM_ICONS[detectedPlatform]?.label ?? detectedPlatform}
              </p>
            )}
          </div>

          <div>
            <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "6px" }}>
              Title
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="My link title"
              className="w-full rounded-xl px-4 py-2.5 text-white outline-none placeholder-white/20"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: errors.title ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)",
                fontSize: "14px",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#a855f7")}
              onBlur={(e) => (e.target.style.borderColor = errors.title ? "#ef4444" : "rgba(255,255,255,0.1)")}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            {errors.title && <p className="text-red-400 mt-1" style={{ fontSize: "11px" }}>{errors.title}</p>}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              className="flex-1 py-2.5 rounded-xl text-white transition-all"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #db2777)",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Add Link
            </button>
            <button
              onClick={() => { setShowAddForm(false); setForm({ title: "", url: "" }); setErrors({}); }}
              className="px-4 py-2.5 rounded-xl transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.5)",
                fontSize: "14px",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Links list */}
      <div className="space-y-2">
        {links.map((link, index) => {
          const cfg = PLATFORM_ICONS[link.platform] ?? PLATFORM_ICONS.generic;
          const Icon = cfg.icon;
          const isExpanded = expandedId === link.id;
          const isDragging = dragIndex === index;
          const isDragOver = dragOverIndex === index;

          return (
            <div
              key={link.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className="rounded-2xl overflow-hidden transition-all"
              style={{
                background: isDragOver
                  ? "rgba(168, 85, 247, 0.12)"
                  : "rgba(255,255,255,0.04)",
                border: isDragOver
                  ? "1px solid rgba(168, 85, 247, 0.4)"
                  : "1px solid rgba(255,255,255,0.07)",
                opacity: isDragging ? 0.5 : 1,
                transform: isDragging ? "scale(0.98)" : "scale(1)",
              }}
            >
              {/* Main row */}
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Drag handle */}
                <div
                  className="flex-shrink-0 cursor-grab active:cursor-grabbing"
                  style={{ color: "rgba(255,255,255,0.2)", touchAction: "none" }}
                >
                  <GripVertical size={15} />
                </div>

                {/* Platform icon */}
                <div
                  className="rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ width: "32px", height: "32px", background: `${cfg.color}18` }}
                >
                  <Icon size={14} style={{ color: cfg.color }} />
                </div>

                {/* Title + URL */}
                <div className="flex-1 min-w-0">
                  <p className="text-white truncate" style={{ fontSize: "13px", fontWeight: 500 }}>
                    {link.title}
                  </p>
                  <p className="truncate" style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                    {link.url}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => onUpdate(link.id, { visible: !link.visible })}
                    className="p-1.5 rounded-lg transition-all"
                    style={{ color: link.visible ? "#a855f7" : "rgba(255,255,255,0.25)" }}
                    title={link.visible ? "Hide link" : "Show link"}
                  >
                    {link.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : link.id)}
                    className="p-1.5 rounded-lg transition-all"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.25)")}
                    title="Edit"
                  >
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  <button
                    onClick={() =>
                      onAdd({
                        title: link.title + " (copy)",
                        url: link.url,
                        visible: false,
                        platform: link.platform,
                        buttonStyle: link.buttonStyle,
                        hoverEffect: link.hoverEffect,
                        scheduleFrom: link.scheduleFrom,
                        scheduleTo: link.scheduleTo,
                        deviceTarget: link.deviceTarget ?? "all",
                      })
                    }
                    className="p-1.5 rounded-lg transition-all"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.25)")}
                    title="Duplicate"
                  >
                    <Copy size={14} />
                  </button>

                  <button
                    onClick={() => onRemove(link.id)}
                    className="p-1.5 rounded-lg transition-all"
                    style={{ color: "rgba(255,255,255,0.2)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#f87171";
                      (e.currentTarget as HTMLElement).style.background = "rgba(239, 68, 68, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.2)";
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Expanded edit section */}
              {isExpanded && (
                <div
                  className="px-4 pb-4 pt-1 space-y-4"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: "5px" }}>
                        Title
                      </label>
                      <input
                        value={link.title}
                        onChange={(e) => onUpdate(link.id, { title: e.target.value })}
                        className="w-full rounded-lg px-3 py-2 text-white outline-none"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          fontSize: "13px",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#a855f7")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: "5px" }}>
                        URL
                      </label>
                      <input
                        value={link.url}
                        onChange={(e) => onUpdate(link.id, { url: e.target.value, platform: detectPlatform(e.target.value) })}
                        className="w-full rounded-lg px-3 py-2 text-white outline-none"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          fontSize: "13px",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#a855f7")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: "6px" }}>
                      Icon / Platform
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                      {Object.entries(PLATFORM_ICONS).filter(([key]) => key !== "generic").map(([platform, iconCfg]) => {
                        const PlatformIcon = iconCfg.icon;
                        return (
                          <button
                            key={platform}
                            onClick={() => onUpdate(link.id, { platform })}
                            className="flex items-center justify-center rounded-lg py-2 transition-all"
                            title={iconCfg.label}
                            style={{
                              background: link.platform === platform ? `${iconCfg.color}22` : "rgba(255,255,255,0.05)",
                              border: link.platform === platform ? `1px solid ${iconCfg.color}66` : "1px solid transparent",
                              color: iconCfg.color,
                            }}
                          >
                            <PlatformIcon size={14} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: "5px" }}>
                        Button Style
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {BUTTON_STYLES.map((style) => (
                          <button
                            key={style}
                            onClick={() => onUpdate(link.id, { buttonStyle: style })}
                            className="py-1.5 rounded-lg text-center transition-all capitalize"
                            style={{
                              fontSize: "11px",
                              fontWeight: 500,
                              background: link.buttonStyle === style ? "rgba(168, 85, 247, 0.25)" : "rgba(255,255,255,0.05)",
                              color: link.buttonStyle === style ? "#c084fc" : "rgba(255,255,255,0.4)",
                              border: link.buttonStyle === style ? "1px solid rgba(168, 85, 247, 0.4)" : "1px solid transparent",
                            }}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: "5px" }}>
                        Hover Effect
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {HOVER_EFFECTS.map((effect) => (
                          <button
                            key={effect}
                            onClick={() => onUpdate(link.id, { hoverEffect: effect })}
                            className="py-1.5 rounded-lg text-center transition-all capitalize"
                            style={{
                              fontSize: "11px",
                              fontWeight: 500,
                              background: link.hoverEffect === effect ? "rgba(168, 85, 247, 0.25)" : "rgba(255,255,255,0.05)",
                              color: link.hoverEffect === effect ? "#c084fc" : "rgba(255,255,255,0.4)",
                              border: link.hoverEffect === effect ? "1px solid rgba(168, 85, 247, 0.4)" : "1px solid transparent",
                            }}
                          >
                            {effect}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: "5px" }}>
                        Show From
                      </label>
                      <input
                        type="date"
                        value={link.scheduleFrom ?? ""}
                        onChange={(e) => onUpdate(link.id, { scheduleFrom: e.target.value })}
                        className="w-full rounded-lg px-3 py-2 text-white outline-none"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          fontSize: "13px",
                          colorScheme: "dark",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: "5px" }}>
                        Show Until
                      </label>
                      <input
                        type="date"
                        value={link.scheduleTo ?? ""}
                        onChange={(e) => onUpdate(link.id, { scheduleTo: e.target.value })}
                        className="w-full rounded-lg px-3 py-2 text-white outline-none"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          fontSize: "13px",
                          colorScheme: "dark",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: "5px" }}>
                      Device Visibility
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(["all", "mobile", "desktop"] as const).map((device) => (
                        <button
                          key={device}
                          onClick={() => onUpdate(link.id, { deviceTarget: device })}
                          className="py-1.5 rounded-lg text-center transition-all capitalize"
                          style={{
                            fontSize: "11px",
                            fontWeight: 500,
                            background: (link.deviceTarget ?? "all") === device ? "rgba(168, 85, 247, 0.25)" : "rgba(255,255,255,0.05)",
                            color: (link.deviceTarget ?? "all") === device ? "#c084fc" : "rgba(255,255,255,0.4)",
                            border: (link.deviceTarget ?? "all") === device ? "1px solid rgba(168, 85, 247, 0.4)" : "1px solid transparent",
                          }}
                        >
                          {device}
                        </button>
                      ))}
                    </div>
                  </div>

                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 transition-colors"
                    style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(168, 85, 247, 0.8)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.3)")}
                  >
                    <ExternalLink size={11} /> Test link
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {links.length === 0 && !showAddForm && (
        <div className="text-center py-12">
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)" }}>
            No links yet. Add your first link above.
          </p>
        </div>
      )}
    </div>
  );
}
