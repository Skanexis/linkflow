import { useEffect, useRef, useState } from "react";
import { Check, Image, Layers, Music, Type, Upload } from "lucide-react";
import type { ProfileTheme } from "../App";

type ThemePreset = {
  name: string;
  mood: string;
  bg1: string;
  bg2: string;
  primary: string;
  text: string;
  type: ProfileTheme["backgroundType"];
  pattern: NonNullable<ProfileTheme["backgroundPattern"]>;
  widgetStyle?: NonNullable<ProfileTheme["widgetStyle"]>;
  buttonStyle?: ProfileTheme["buttonStyle"];
  hoverEffect?: ProfileTheme["hoverEffect"];
  animationPack?: NonNullable<ProfileTheme["animationPack"]>;
  profileStyle?: NonNullable<ProfileTheme["profileStyle"]>;
};

const PRESET_THEMES: ThemePreset[] = [
  { name: "Purple Night", mood: "creator", bg1: "#0f0c29", bg2: "#302b63", primary: "#a855f7", text: "#ffffff", type: "gradient", pattern: "grid", widgetStyle: "glass", animationPack: "smooth" },
  { name: "Cyber Lime", mood: "electronic", bg1: "#04130d", bg2: "#12351f", primary: "#a3e635", text: "#f7fee7", type: "animated", pattern: "grid", widgetStyle: "neon", animationPack: "beat" },
  { name: "Cherry Glass", mood: "pop", bg1: "#210008", bg2: "#6d1231", primary: "#fb7185", text: "#fff1f2", type: "gradient", pattern: "dots", widgetStyle: "glass", animationPack: "pop" },
  { name: "Aurora", mood: "ambient", bg1: "#06111f", bg2: "#0f766e", primary: "#5eead4", text: "#ecfeff", type: "animated", pattern: "rays", widgetStyle: "glass", animationPack: "cinematic" },
  { name: "Ink Studio", mood: "minimal", bg1: "#050505", bg2: "#202020", primary: "#f5f5f5", text: "#ffffff", type: "solid", pattern: "none", widgetStyle: "outline", animationPack: "minimal" },
  { name: "Solar Pop", mood: "radio", bg1: "#371600", bg2: "#7c2d12", primary: "#facc15", text: "#fff7ed", type: "gradient", pattern: "rays", widgetStyle: "solid", animationPack: "pop" },
  { name: "Deep Ocean", mood: "dream", bg1: "#00111f", bg2: "#003b73", primary: "#38bdf8", text: "#f0f9ff", type: "gradient", pattern: "stars", widgetStyle: "glass", animationPack: "smooth" },
  { name: "Editorial", mood: "clean", bg1: "#111111", bg2: "#3f3f46", primary: "#eab308", text: "#fafafa", type: "gradient", pattern: "none", widgetStyle: "outline", animationPack: "minimal", profileStyle: "editorial" },
  { name: "Berry Wave", mood: "dance", bg1: "#190026", bg2: "#831843", primary: "#f0abfc", text: "#fdf4ff", type: "animated", pattern: "waves", widgetStyle: "glass", animationPack: "waveform" },
  { name: "Clean Slate", mood: "light", bg1: "#e2e8f0", bg2: "#f8fafc", primary: "#0f172a", text: "#0f172a", type: "gradient", pattern: "grid", widgetStyle: "solid", animationPack: "minimal" },
  { name: "Terminal", mood: "live code", bg1: "#020617", bg2: "#052e16", primary: "#22c55e", text: "#dcfce7", type: "solid", pattern: "grid", widgetStyle: "outline", animationPack: "beat", profileStyle: "terminal" },
  { name: "Hotline", mood: "night drive", bg1: "#12091f", bg2: "#be123c", primary: "#fb923c", text: "#fff7ed", type: "animated", pattern: "rays", widgetStyle: "neon", animationPack: "club" },
  { name: "Synthwave FM", mood: "retro synth", bg1: "#080012", bg2: "#30105d", primary: "#ff2bd6", text: "#fdf4ff", type: "animated", pattern: "equalizer", widgetStyle: "neon", buttonStyle: "neon", hoverEffect: "glow", animationPack: "beat" },
  { name: "Bassline Club", mood: "club set", bg1: "#030712", bg2: "#042f2e", primary: "#14f195", text: "#ecfeff", type: "animated", pattern: "equalizer", widgetStyle: "neon", buttonStyle: "glass", hoverEffect: "bounce", animationPack: "club" },
  { name: "Lo-Fi Tape", mood: "chill beats", bg1: "#14100d", bg2: "#3b2f2f", primary: "#f4a261", text: "#fff7ed", type: "gradient", pattern: "waves", widgetStyle: "solid", buttonStyle: "soft", hoverEffect: "tilt", animationPack: "waveform" },
  { name: "Disco Gold", mood: "funk", bg1: "#120f08", bg2: "#4a2f06", primary: "#facc15", text: "#fefce8", type: "animated", pattern: "dots", widgetStyle: "glass", buttonStyle: "pill", hoverEffect: "bounce", animationPack: "pop" },
  { name: "Midnight R&B", mood: "slow jam", bg1: "#09090b", bg2: "#312e81", primary: "#c4b5fd", text: "#f5f3ff", type: "gradient", pattern: "stars", widgetStyle: "glass", buttonStyle: "glass", hoverEffect: "glow", animationPack: "smooth" },
  { name: "Indie Stage", mood: "band", bg1: "#101512", bg2: "#4d2f19", primary: "#fb7185", text: "#fff7ed", type: "gradient", pattern: "rays", widgetStyle: "solid", buttonStyle: "rounded", hoverEffect: "slide", animationPack: "cinematic" },
  { name: "Hyperpop", mood: "fast bpm", bg1: "#16051f", bg2: "#005f73", primary: "#00f5d4", text: "#f8fafc", type: "animated", pattern: "equalizer", widgetStyle: "neon", buttonStyle: "neon", hoverEffect: "expand", animationPack: "club" },
  { name: "Warehouse", mood: "techno", bg1: "#050505", bg2: "#1f2937", primary: "#f43f5e", text: "#f8fafc", type: "animated", pattern: "grid", widgetStyle: "outline", buttonStyle: "brutal", hoverEffect: "glow", animationPack: "beat" },
  { name: "Jazz Velvet", mood: "late night", bg1: "#0c0a09", bg2: "#451a03", primary: "#d97706", text: "#fffbeb", type: "gradient", pattern: "waves", widgetStyle: "glass", buttonStyle: "underline", hoverEffect: "slide", animationPack: "cinematic", profileStyle: "editorial" },
  { name: "Festival Dawn", mood: "anthem", bg1: "#051923", bg2: "#7c2d12", primary: "#2dd4bf", text: "#fff7ed", type: "animated", pattern: "rays", widgetStyle: "glass", buttonStyle: "soft", hoverEffect: "bounce", animationPack: "waveform" },
];

const FONTS = [
  { value: "Inter", label: "Inter", preview: "Clean creator profile" },
  { value: "Poppins", label: "Poppins", preview: "Soft modern creator page" },
  { value: "Montserrat", label: "Montserrat", preview: "Bold polished profile" },
  { value: "Outfit", label: "Outfit", preview: "Fresh digital identity" },
  { value: "Sora", label: "Sora", preview: "Premium tech profile" },
  { value: "Urbanist", label: "Urbanist", preview: "Minimal studio links" },
  { value: "Rubik", label: "Rubik", preview: "Friendly rounded profile" },
  { value: "Raleway", label: "Raleway", preview: "Elegant creator links" },
  { value: "Archivo", label: "Archivo", preview: "Strong editorial system" },
  { value: "IBM Plex Sans", label: "IBM Plex Sans", preview: "Professional maker page" },
  { value: "Playfair Display", label: "Playfair", preview: "Editorial launch page" },
  { value: "Lora", label: "Lora", preview: "Warm journal profile" },
  { value: "Cormorant Garamond", label: "Cormorant", preview: "Luxury artist page" },
  { value: "Libre Baskerville", label: "Libre Baskerville", preview: "Classic author profile" },
  { value: "Roboto Slab", label: "Roboto Slab", preview: "Confident media kit" },
  { value: "Space Grotesk", label: "Space Grotesk", preview: "Future-ready links" },
  { value: "Nunito", label: "Nunito", preview: "Friendly community hub" },
  { value: "DM Sans", label: "DM Sans", preview: "Modern product profile" },
  { value: "Oswald", label: "Oswald", preview: "Condensed stage poster" },
  { value: "Anton", label: "Anton", preview: "BIG TOUR ANNOUNCEMENT" },
  { value: "Bebas Neue", label: "Bebas Neue", preview: "LOUD DROP TODAY" },
  { value: "Permanent Marker", label: "Permanent Marker", preview: "Handmade street drop" },
  { value: "Pacifico", label: "Pacifico", preview: "Signature creator style" },
  { value: "Caveat", label: "Caveat", preview: "Personal handwritten note" },
  { value: "Manrope", label: "Manrope", preview: "Polished business page" },
  { value: "Syne", label: "Syne", preview: "Creative portfolio" },
  { value: "Chakra Petch", label: "Chakra Petch", preview: "Electronic music profile" },
  { value: "JetBrains Mono", label: "JetBrains Mono", preview: "dev@linkflow:~$" },
  { value: "Fira Code", label: "Fira Code", preview: "const links = tracks" },
  { value: "IBM Plex Mono", label: "IBM Plex Mono", preview: "terminal.fm/live" },
];

type Tab = "background" | "widgets" | "motion" | "typography";

interface AppearanceEditorProps {
  theme: ProfileTheme;
  onUpdate: (u: Partial<ProfileTheme>) => void;
}

export function AppearanceEditor({ theme, onUpdate }: AppearanceEditorProps) {
  const [currentTab, setCurrentTab] = useState<Tab>("background");
  const tabs: { id: Tab; label: string; icon: React.ComponentType<any> }[] = [
    { id: "background", label: "Background", icon: Image },
    { id: "widgets", label: "Blocks", icon: Layers },
    { id: "motion", label: "Motion", icon: Music },
    { id: "typography", label: "Fonts", icon: Type },
  ];

  const handleBackgroundUpload = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onUpdate({
        backgroundType: "image",
        backgroundImage: String(reader.result),
        backgroundPattern: "none",
        backgroundOverlay: theme.backgroundOverlay ?? 45,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-1 rounded-xl p-1" style={{ background: "rgba(255,255,255,0.05)" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className="flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all"
            style={{
              fontSize: "12px",
              background: currentTab === tab.id ? "rgba(255,255,255,0.12)" : "transparent",
              color: currentTab === tab.id ? "white" : "rgba(255,255,255,0.45)",
            }}
          >
            <tab.icon size={13} />
            {tab.label}
          </button>
        ))}
      </div>

      {currentTab === "background" && (
        <div className="space-y-5">
          <Panel title="Theme Presets">
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(132px, 1fr))" }}
            >
              {PRESET_THEMES.map((preset) => {
                const selected = theme.bgColor1 === preset.bg1 && theme.bgColor2 === preset.bg2;
                return (
                  <button
                    key={preset.name}
                    onClick={() =>
                      onUpdate({
                        backgroundType: preset.type,
                        bgColor1: preset.bg1,
                        bgColor2: preset.bg2,
                        primaryColor: preset.primary,
                        textColor: preset.text,
                        backgroundPattern: preset.pattern,
                        widgetStyle: preset.widgetStyle ?? theme.widgetStyle,
                        buttonStyle: preset.buttonStyle ?? theme.buttonStyle,
                        hoverEffect: preset.hoverEffect ?? theme.hoverEffect,
                        animationPack: preset.animationPack ?? theme.animationPack,
                        profileStyle: preset.profileStyle ?? theme.profileStyle,
                      })
                    }
                    className="relative overflow-hidden rounded-2xl p-2 text-left transition-all"
                    style={{
                      minHeight: "132px",
                      background: "rgba(255,255,255,0.035)",
                      border: selected ? "1px solid rgba(255,255,255,0.72)" : "1px solid rgba(255,255,255,0.08)",
                      boxShadow: selected ? `0 0 0 2px ${preset.primary}55` : "none",
                    }}
                  >
                    <div
                      className="relative overflow-hidden rounded-xl"
                      style={{
                        height: "86px",
                        background: `linear-gradient(155deg, ${preset.bg1}, ${preset.bg2})`,
                        border: `1px solid ${preset.text}18`,
                      }}
                    >
                      <div className="absolute left-1/2 top-2 h-2 w-10 -translate-x-1/2 rounded-full" style={{ background: "rgba(0,0,0,0.36)" }} />
                      <div className="absolute left-1/2 top-6 h-6 w-6 -translate-x-1/2 rounded-full" style={{ background: `linear-gradient(135deg, ${preset.primary}, ${preset.text}80)` }} />
                      <div className="absolute bottom-3 left-3 right-3 rounded-lg" style={{ height: "25px", background: `${preset.text}14`, border: `1px solid ${preset.text}18` }}>
                        <div className="absolute bottom-1.5 left-2 right-2 flex items-end gap-1">
                          {[0.38, 0.75, 0.52, 0.92, 0.44].map((level, index) => (
                            <span key={index} className="block flex-1 rounded-full" style={{ height: `${level * 16}px`, background: preset.primary }} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate" style={{ color: "white", fontSize: "12px", fontWeight: 800 }}>{preset.name}</p>
                        <p className="truncate" style={{ color: "rgba(255,255,255,0.38)", fontSize: "10px", fontWeight: 600 }}>{preset.mood}</p>
                      </div>
                      <span className="h-4 w-4 flex-shrink-0 rounded-full" style={{ background: preset.primary }} />
                    </div>
                    {selected && (
                      <span className="absolute right-1.5 top-1.5">
                        <CheckMark />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel title="Custom Background">
            <label
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-5 transition-all hover:bg-white/5"
              style={{ borderColor: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.75)", fontSize: "13px" }}
            >
              <Upload size={16} />
              Upload image background
              <input type="file" accept="image/*" className="hidden" onChange={(event) => handleBackgroundUpload(event.target.files?.[0])} />
            </label>
            {theme.backgroundImage && (
              <button
                onClick={() => onUpdate({ backgroundImage: "", backgroundType: "gradient" })}
                className="mt-3 rounded-xl px-3 py-2"
                style={{ background: "rgba(239,68,68,0.12)", color: "#fca5a5", fontSize: "12px" }}
              >
                Remove uploaded image
              </button>
            )}
          </Panel>

          <Panel title="Background Type">
            <Segmented
              value={theme.backgroundType}
              options={[
                ["solid", "Solid"],
                ["gradient", "Gradient"],
                ["animated", "Animated"],
                ["image", "Image"],
              ]}
              onChange={(value) => onUpdate({ backgroundType: value as ProfileTheme["backgroundType"] })}
            />
          </Panel>

          <Panel title="Pattern">
            <Segmented
              value={theme.backgroundPattern ?? "grid"}
              options={[
                ["none", "None"],
                ["grid", "Grid"],
                ["dots", "Dots"],
                ["stars", "Stars"],
                ["rays", "Rays"],
                ["waves", "Waves"],
                ["equalizer", "EQ"],
              ]}
              onChange={(value) => onUpdate({ backgroundPattern: value as NonNullable<ProfileTheme["backgroundPattern"]> })}
            />
          </Panel>

          <Panel title="Colors">
            <ColorRow label="Background 1" value={theme.bgColor1} onChange={(value) => onUpdate({ bgColor1: value })} />
            <ColorRow label="Background 2" value={theme.bgColor2} onChange={(value) => onUpdate({ bgColor2: value })} />
          </Panel>

          <Panel title="Image Overlay">
            <OverlaySlider value={theme.backgroundOverlay ?? 45} onCommit={(value) => onUpdate({ backgroundOverlay: value })} />
          </Panel>
        </div>
      )}

      {currentTab === "widgets" && (
        <div className="space-y-5">
          <Panel title="Widget Surface">
            <ChoiceGrid
              value={theme.widgetStyle ?? "glass"}
              options={[
                ["glass", "Glass", "Blurred premium panels"],
                ["solid", "Solid", "High contrast blocks"],
                ["outline", "Outline", "Minimal line cards"],
                ["neon", "Neon", "Glow-heavy stage cards"],
              ]}
              onChange={(value) => onUpdate({ widgetStyle: value as NonNullable<ProfileTheme["widgetStyle"]> })}
            />
          </Panel>
          <Panel title="Button Style">
            <ChoiceGrid
              value={theme.buttonStyle}
              options={[
                ["pill", "Pill", "Soft rounded links"],
                ["rounded", "Rounded", "Balanced rectangles"],
                ["glass", "Glass", "Transparent frosted links"],
                ["3d", "3D", "Pressed depth effect"],
                ["neon", "Neon", "Glowing border links"],
                ["soft", "Soft", "Layered gradient links"],
                ["brutal", "Brutal", "High contrast offset"],
                ["underline", "Underline", "Editorial text links"],
              ]}
              onChange={(value) => onUpdate({ buttonStyle: value as ProfileTheme["buttonStyle"] })}
            />
          </Panel>
          <Panel title="Hover Motion">
            <Segmented
              value={theme.hoverEffect}
              options={[
                ["none", "None"],
                ["glow", "Glow"],
                ["bounce", "Lift"],
                ["expand", "Scale"],
                ["tilt", "Tilt"],
                ["slide", "Slide"],
              ]}
              onChange={(value) => onUpdate({ hoverEffect: value as ProfileTheme["hoverEffect"] })}
            />
          </Panel>
          <Panel title="Layout">
            <Segmented
              value={theme.layoutMode}
              options={[
                ["vertical", "Vertical"],
                ["grid", "Grid"],
              ]}
              onChange={(value) => onUpdate({ layoutMode: value as ProfileTheme["layoutMode"] })}
            />
          </Panel>
        </div>
      )}

      {currentTab === "motion" && (
        <div className="space-y-5">
          <Panel title="Rhythm Animation">
            <ChoiceGrid
              value={theme.animationPack ?? "smooth"}
              options={[
                ["smooth", "Smooth", "Slow ambient movement"],
                ["beat", "Beat", "Pulse follows track BPM"],
                ["waveform", "Waveform", "Sweeping audio waves"],
                ["club", "Club", "Sharper stage lighting"],
                ["neon", "Neon", "Glow-focused pulses"],
                ["cinematic", "Cinematic", "Wide soft transitions"],
                ["minimal", "Minimal", "Quiet, reduced motion"],
              ]}
              onChange={(value) => onUpdate({ animationPack: value as NonNullable<ProfileTheme["animationPack"]> })}
            />
          </Panel>
          <Panel title="Content Width">
            <Segmented
              value={theme.contentWidth ?? "comfortable"}
              options={[
                ["compact", "Compact"],
                ["comfortable", "Normal"],
                ["wide", "Wide"],
              ]}
              onChange={(value) => onUpdate({ contentWidth: value as NonNullable<ProfileTheme["contentWidth"]> })}
            />
          </Panel>
        </div>
      )}

      {currentTab === "typography" && (
        <Panel title="Font Family">
          <div className="space-y-2">
            {FONTS.map((font) => (
              <button
                key={font.value}
                onClick={() => onUpdate({ fontFamily: font.value })}
                className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-all"
                style={{
                  background: theme.fontFamily === font.value ? "rgba(168,85,247,0.16)" : "rgba(255,255,255,0.04)",
                  border: theme.fontFamily === font.value ? "1px solid rgba(168,85,247,0.4)" : "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div>
                  <p style={{ color: "white", fontFamily: font.value, fontSize: "14px", fontWeight: 700 }}>{font.label}</p>
                  <p style={{ color: "rgba(255,255,255,0.48)", fontFamily: font.value, fontSize: "16px" }}>{font.preview}</p>
                </div>
                {theme.fontFamily === font.value && <CheckMark />}
              </button>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <h3 className="mb-4 text-white" style={{ fontSize: "13px", fontWeight: 700 }}>{title}</h3>
      {children}
    </section>
  );
}

function Segmented({ value, options, onChange }: { value?: string; options: [string, string][]; onChange: (value: string) => void }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(76px, 1fr))" }}>
      {options.map(([optionValue, label]) => (
        <button
          key={optionValue}
          onClick={() => onChange(optionValue)}
          className="rounded-xl px-2 py-2.5 transition-all"
          style={{
            background: value === optionValue ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.05)",
            border: value === optionValue ? "1px solid rgba(168,85,247,0.45)" : "1px solid transparent",
            color: value === optionValue ? "#ddd6fe" : "rgba(255,255,255,0.48)",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function ChoiceGrid({ value, options, onChange }: { value?: string; options: [string, string, string][]; onChange: (value: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
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

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span className="w-24" style={{ color: "rgba(255,255,255,0.55)", fontSize: "12px" }}>{label}</span>
      <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-9 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 rounded-lg px-3 py-2 font-mono text-white outline-none"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "12px" }}
      />
    </div>
  );
}

function OverlaySlider({ value, onCommit }: { value: number; onCommit: (value: number) => void }) {
  const [draft, setDraft] = useState(value);
  const lastCommitted = useRef(value);
  const commitTimer = useRef<number | null>(null);
  const isSliding = useRef(false);

  useEffect(() => {
    if (isSliding.current) return;
    setDraft(value);
    lastCommitted.current = value;
  }, [value]);

  useEffect(() => {
    return () => {
      if (commitTimer.current) window.clearTimeout(commitTimer.current);
    };
  }, []);

  const commit = (next = draft) => {
    const normalized = Math.max(0, Math.min(90, Math.round(next)));
    if (commitTimer.current) window.clearTimeout(commitTimer.current);
    if (lastCommitted.current === normalized) return;
    lastCommitted.current = normalized;
    onCommit(normalized);
  };

  const scheduleCommit = (next: number) => {
    if (commitTimer.current) window.clearTimeout(commitTimer.current);
    commitTimer.current = window.setTimeout(() => {
      isSliding.current = false;
      commit(next);
    }, 450);
  };

  const updateDraft = (next: number) => {
    isSliding.current = true;
    setDraft(next);
    scheduleCommit(next);
  };

  const presets = [0, 35, 60, 80];
  const fill = `${(draft / 90) * 100}%`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "12px", fontWeight: 700 }}>Darken uploaded image</p>
          <p style={{ color: "rgba(255,255,255,0.34)", fontSize: "11px", lineHeight: 1.35 }}>Saved after you stop sliding</p>
        </div>
        <div
          className="rounded-xl px-3 py-2 text-right"
          style={{ background: "rgba(168,85,247,0.14)", border: "1px solid rgba(168,85,247,0.28)", color: "#ddd6fe", minWidth: "58px" }}
        >
          <span style={{ fontSize: "16px", fontWeight: 900 }}>{draft}</span>
          <span style={{ fontSize: "11px", fontWeight: 800 }}>%</span>
        </div>
      </div>

      <div className="relative rounded-2xl px-3 py-4" style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div
          className="pointer-events-none absolute left-3 right-3 top-1/2 h-2 -translate-y-1/2 rounded-full"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
        <div
          className="pointer-events-none absolute left-3 top-1/2 h-2 -translate-y-1/2 rounded-full"
          style={{ width: fill, maxWidth: "calc(100% - 24px)", background: "linear-gradient(90deg, #7c3aed, #ec4899)" }}
        />
        <input
          type="range"
          min={0}
          max={90}
          step={1}
          value={draft}
          onPointerDown={() => {
            isSliding.current = true;
          }}
          onPointerUp={(event) => {
            isSliding.current = false;
            commit(Number(event.currentTarget.value));
          }}
          onPointerCancel={(event) => {
            isSliding.current = false;
            commit(Number(event.currentTarget.value));
          }}
          onKeyUp={(event) => commit(Number(event.currentTarget.value))}
          onChange={(event) => updateDraft(Number(event.target.value))}
          className="overlay-slider relative z-10 w-full"
          aria-label="Image overlay percentage"
        />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {presets.map((preset) => (
          <button
            key={preset}
            onClick={() => {
              isSliding.current = false;
              setDraft(preset);
              commit(preset);
            }}
            className="rounded-xl px-2 py-2 transition-all"
            style={{
              background: draft === preset ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.05)",
              border: draft === preset ? "1px solid rgba(168,85,247,0.42)" : "1px solid rgba(255,255,255,0.07)",
              color: draft === preset ? "#ddd6fe" : "rgba(255,255,255,0.48)",
              fontSize: "12px",
              fontWeight: 800,
            }}
          >
            {preset}%
          </button>
        ))}
      </div>
    </div>
  );
}

function CheckMark() {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-white">
      <Check size={11} />
    </span>
  );
}
