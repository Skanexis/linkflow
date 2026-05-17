import { BadgeCheck, Box, Circle, Palette, Sparkles, Wand2 } from "lucide-react";
import type { ProfileTheme, UserProfile } from "../App";

const AVATAR_COLORS = [
  "#7c3aed", "#db2777", "#0ea5e9", "#10b981",
  "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1",
];

const ACCENT_COLORS = [
  "#a855f7", "#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#14b8a6", "#f97316", "#06b6d4", "#84cc16", "#f5f5f5",
];

const TEXT_COLORS = ["#ffffff", "#f8fafc", "#fef3c7", "#dcfce7", "#e0f2fe", "#0f172a", "#111827", "#000000"];

const BIO_TEMPLATES = [
  "Designer & builder | New projects weekly | Open for collabs",
  "Content creator | Behind the scenes, resources, and drops",
  "Founder mode | Products, essays, and useful links in one place",
  "Artist / creator | Commissions open | Latest work below",
];

interface ProfileEditorProps {
  profile: UserProfile;
  theme: ProfileTheme;
  onUpdate: (updates: Partial<UserProfile>) => void;
  onUpdateTheme: (updates: Partial<ProfileTheme>) => void;
}

export function ProfileEditor({ profile, theme, onUpdate, onUpdateTheme }: ProfileEditorProps) {
  const handleDisplayNameChange = (name: string) => {
    const words = name.trim().split(" ").filter(Boolean);
    const initials = words.length >= 2
      ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
    onUpdate({ displayName: name, initials });
  };

  return (
    <div className="space-y-6">
      <Panel title="Profile Style" icon={Palette}>
        <div className="flex items-center gap-5 mb-5">
          <div
            className="rounded-full flex items-center justify-center text-white flex-shrink-0"
            style={{
              width: "76px",
              height: "76px",
              background: `linear-gradient(135deg, ${profile.avatarColor}, ${theme.primaryColor})`,
              fontSize: "22px",
              fontWeight: 800,
              boxShadow: `0 0 28px ${profile.avatarColor}55, 0 0 34px ${theme.primaryColor}35`,
            }}
          >
            {profile.initials || "??"}
          </div>
          <div className="min-w-0">
            <p className="text-white mb-1" style={{ fontSize: "14px", fontWeight: 700 }}>
              Avatar, accent, icons and motion
            </p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.38)", lineHeight: 1.45 }}>
              All personal styling lives here, so the profile preview changes without jumping between sections.
            </p>
          </div>
        </div>

        <ColorBlock label="Avatar color" colors={AVATAR_COLORS} value={profile.avatarColor} onChange={(color) => onUpdate({ avatarColor: color })} />
        <ColorBlock label="Accent color" colors={ACCENT_COLORS} value={theme.primaryColor} onChange={(color) => onUpdateTheme({ primaryColor: color })} />
        <ColorBlock label="Text color" colors={TEXT_COLORS} value={theme.textColor} onChange={(color) => onUpdateTheme({ textColor: color })} />

        <div className="mt-5 grid grid-cols-1 gap-4">
          <div>
            <SectionLabel icon={BadgeCheck} label="Header style" />
            <ChoiceGrid
              value={theme.profileStyle ?? "halo"}
              options={[
                ["halo", "Halo", "Centered glow avatar"],
                ["editorial", "Editorial", "Bold name treatment"],
                ["terminal", "Terminal", "Developer console vibe"],
                ["poster", "Poster", "Large creator badge"],
              ]}
              onChange={(value) => onUpdateTheme({ profileStyle: value as NonNullable<ProfileTheme["profileStyle"]> })}
            />
          </div>

          <div>
            <SectionLabel icon={Wand2} label="Animation pack" />
            <ChoiceGrid
              value={theme.animationPack ?? "smooth"}
              options={[
                ["smooth", "Smooth", "Soft fade and lift"],
                ["pop", "Pop", "Bouncy creator cards"],
                ["cinematic", "Cinematic", "Slower reveal"],
                ["neon", "Neon", "Glow and pulse"],
                ["minimal", "Minimal", "Reduced motion"],
              ]}
              onChange={(value) => onUpdateTheme({ animationPack: value as NonNullable<ProfileTheme["animationPack"]> })}
            />
          </div>

          <div>
            <SectionLabel icon={Box} label="Icon pack" />
            <ChoiceGrid
              value={theme.iconStyle ?? "brand"}
              options={[
                ["brand", "Brand", "Platform colors"],
                ["mono", "Mono", "Clean text color"],
                ["duotone", "Duotone", "Accent badges"],
                ["boxed", "Boxed", "Filled icon tiles"],
              ]}
              onChange={(value) => onUpdateTheme({ iconStyle: value as NonNullable<ProfileTheme["iconStyle"]> })}
            />
          </div>
        </div>
      </Panel>

      <Panel title="Profile Info" icon={Circle}>
        <div className="space-y-5">
          <div>
            <label className="block mb-1.5" style={labelStyle}>
              Display Name
            </label>
            <input
              value={profile.displayName}
              onChange={(e) => handleDisplayNameChange(e.target.value)}
              placeholder="Your Name"
              className="w-full rounded-xl px-4 py-3 text-white outline-none transition-all placeholder-white/20"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = theme.primaryColor)}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          <div>
            <label className="block mb-1.5" style={labelStyle}>
              Username (slug)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)" }}>
                @
              </span>
              <input
                value={profile.username}
                onChange={(e) =>
                  onUpdate({ username: e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, "") })
                }
                placeholder="yourname"
                className="w-full rounded-xl pl-8 pr-4 py-3 text-white outline-none transition-all placeholder-white/20"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = theme.primaryColor)}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
            {profile.username && (
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", marginTop: "6px" }}>
                linkflow.io/{profile.username}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1.5" style={labelStyle}>Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => onUpdate({ bio: e.target.value })}
              placeholder="Tell the world about yourself..."
              rows={3}
              className="w-full rounded-xl px-4 py-3 text-white outline-none transition-all resize-none placeholder-white/20"
              style={{ ...inputStyle, lineHeight: 1.6 }}
              onFocus={(e) => (e.target.style.borderColor = theme.primaryColor)}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", marginTop: "4px", textAlign: "right" }}>
              {profile.bio.length}/150
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {BIO_TEMPLATES.map((template) => (
                <button
                  key={template}
                  onClick={() => onUpdate({ bio: template })}
                  className="rounded-full px-3 py-1.5 transition-all hover:bg-white/10"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.58)", fontSize: "11px" }}
                >
                  {template.split("|")[0].trim()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="Avatar Initials" icon={Sparkles}>
        <div className="flex items-center gap-4">
          <div
            className="rounded-full flex items-center justify-center text-white flex-shrink-0"
            style={{
              width: "52px",
              height: "52px",
              background: `linear-gradient(135deg, ${profile.avatarColor}, ${theme.primaryColor})`,
              fontSize: "16px",
              fontWeight: 800,
            }}
          >
            {profile.initials || "??"}
          </div>
          <input
            value={profile.initials}
            onChange={(e) => onUpdate({ initials: e.target.value.toUpperCase().slice(0, 3) })}
            placeholder="AB"
            maxLength={3}
            className="w-24 rounded-xl px-4 py-3 text-white text-center outline-none transition-all placeholder-white/20"
            style={{ ...inputStyle, fontSize: "18px", fontWeight: 800 }}
            onFocus={(e) => (e.target.style.borderColor = theme.primaryColor)}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
          />
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", flex: 1 }}>
            1-3 characters shown on your avatar
          </p>
        </div>
      </Panel>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "rgba(255,255,255,0.55)",
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.1)",
  fontSize: "14px",
};

function Panel({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<any>; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <h3 className="mb-4 flex items-center gap-2 text-white" style={{ fontSize: "14px", fontWeight: 800 }}>
        <Icon size={15} style={{ color: "#c084fc" }} />
        {title}
      </h3>
      {children}
    </section>
  );
}

function SectionLabel({ icon: Icon, label }: { icon: React.ComponentType<any>; label: string }) {
  return (
    <p className="mb-2 flex items-center gap-2" style={{ color: "rgba(255,255,255,0.62)", fontSize: "12px", fontWeight: 800 }}>
      <Icon size={13} />
      {label}
    </p>
  );
}

function ColorBlock({ label, colors, value, onChange }: { label: string; colors: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span style={{ color: "rgba(255,255,255,0.62)", fontSize: "12px", fontWeight: 800 }}>{label}</span>
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 w-11 cursor-pointer rounded-lg border border-white/10 bg-transparent"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <Swatch key={color} color={color} selected={value === color} onClick={() => onChange(color)} />
        ))}
      </div>
    </div>
  );
}

function Swatch({ color, selected, onClick }: { color: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full transition-all"
      style={{
        width: "31px",
        height: "31px",
        background: color,
        border: color === "#ffffff" || color === "#f5f5f5" ? "1px solid rgba(0,0,0,0.25)" : "1px solid rgba(255,255,255,0.2)",
        outline: selected ? "2px solid white" : "none",
        outlineOffset: "2px",
        transform: selected ? "scale(1.12)" : "scale(1)",
        boxShadow: selected ? `0 0 14px ${color}70` : "none",
      }}
    />
  );
}

function ChoiceGrid({ value, options, onChange }: { value?: string; options: [string, string, string][]; onChange: (value: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map(([optionValue, label, description]) => (
        <button
          key={optionValue}
          onClick={() => onChange(optionValue)}
          className="rounded-xl p-3 text-left transition-all"
          style={{
            background: value === optionValue ? "rgba(168,85,247,0.16)" : "rgba(255,255,255,0.04)",
            border: value === optionValue ? "1px solid rgba(168,85,247,0.42)" : "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <p style={{ color: "white", fontSize: "13px", fontWeight: 800 }}>{label}</p>
          <p style={{ color: "rgba(255,255,255,0.38)", fontSize: "11px", lineHeight: 1.35 }}>{description}</p>
        </button>
      ))}
    </div>
  );
}
