import type { UserProfile } from "../App";

const AVATAR_COLORS = [
  "#7c3aed", "#db2777", "#0ea5e9", "#10b981",
  "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1",
];

const BIO_TEMPLATES = [
  "Designer & builder | New projects weekly | Open for collabs",
  "Content creator | Behind the scenes, resources, and drops",
  "Founder mode | Products, essays, and useful links in one place",
  "Artist / creator | Commissions open | Latest work below",
];

interface ProfileEditorProps {
  profile: UserProfile;
  onUpdate: (updates: Partial<UserProfile>) => void;
}

export function ProfileEditor({ profile, onUpdate }: ProfileEditorProps) {
  const handleDisplayNameChange = (name: string) => {
    const words = name.trim().split(" ").filter(Boolean);
    const initials = words.length >= 2
      ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
    onUpdate({ displayName: name, initials });
  };

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div
        className="rounded-2xl p-6"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <h3 className="text-white mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>
          Avatar
        </h3>

        <div className="flex items-center gap-5 mb-5">
          <div
            className="rounded-full flex items-center justify-center text-white flex-shrink-0"
            style={{
              width: "72px",
              height: "72px",
              background: profile.avatarColor,
              fontSize: "22px",
              fontWeight: 700,
              boxShadow: `0 0 24px ${profile.avatarColor}60`,
            }}
          >
            {profile.initials}
          </div>
          <div>
            <p className="text-white mb-1" style={{ fontSize: "14px", fontWeight: 500 }}>
              Choose avatar color
            </p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
              Your initials will be shown on your profile
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {AVATAR_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => onUpdate({ avatarColor: color })}
              className="rounded-full transition-all"
              style={{
                width: "32px",
                height: "32px",
                background: color,
                outline: profile.avatarColor === color ? `3px solid white` : "none",
                outlineOffset: "2px",
                boxShadow: profile.avatarColor === color ? `0 0 12px ${color}80` : "none",
                transform: profile.avatarColor === color ? "scale(1.15)" : "scale(1)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Profile info */}
      <div
        className="rounded-2xl p-6 space-y-5"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <h3 className="text-white" style={{ fontSize: "14px", fontWeight: 600 }}>
          Profile Info
        </h3>

        <div>
          <label className="block mb-1.5" style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>
            Display Name
          </label>
          <input
            value={profile.displayName}
            onChange={(e) => handleDisplayNameChange(e.target.value)}
            placeholder="Your Name"
            className="w-full rounded-xl px-4 py-3 text-white outline-none transition-all placeholder-white/20"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
              fontSize: "14px",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#a855f7")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
          />
        </div>

        <div>
          <label className="block mb-1.5" style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>
            Username (slug)
          </label>
          <div className="relative">
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)" }}
            >
              @
            </span>
            <input
              value={profile.username}
              onChange={(e) =>
                onUpdate({ username: e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, "") })
              }
              placeholder="yourname"
              className="w-full rounded-xl pl-8 pr-4 py-3 text-white outline-none transition-all placeholder-white/20"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
                fontSize: "14px",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#a855f7")}
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
          <div className="flex items-center justify-between mb-1.5">
            <label style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>Bio</label>
          </div>
          <textarea
            value={profile.bio}
            onChange={(e) => onUpdate({ bio: e.target.value })}
            placeholder="Tell the world about yourself..."
            rows={3}
            className="w-full rounded-xl px-4 py-3 text-white outline-none transition-all resize-none placeholder-white/20"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
              fontSize: "14px",
              lineHeight: 1.6,
            }}
            onFocus={(e) => (e.target.style.borderColor = "#a855f7")}
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

      {/* Custom initials */}
      <div
        className="rounded-2xl p-6"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <h3 className="text-white mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>
          Avatar Initials
        </h3>
        <div className="flex items-center gap-4">
          <div
            className="rounded-full flex items-center justify-center text-white flex-shrink-0"
            style={{
              width: "52px",
              height: "52px",
              background: profile.avatarColor,
              fontSize: "16px",
              fontWeight: 700,
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
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "0.1em",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#a855f7")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
          />
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", flex: 1 }}>
            1–3 characters shown on your avatar
          </p>
        </div>
      </div>
    </div>
  );
}
