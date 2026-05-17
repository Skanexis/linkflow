import { useState } from "react";
import { Check, Image, Layers, Type, Upload } from "lucide-react";
import type { ProfileTheme } from "../App";

const PRESET_THEMES: {
  name: string;
  bg1: string;
  bg2: string;
  primary: string;
  text: string;
  type: ProfileTheme["backgroundType"];
  pattern: NonNullable<ProfileTheme["backgroundPattern"]>;
}[] = [
  { name: "Purple Night", bg1: "#0f0c29", bg2: "#302b63", primary: "#a855f7", text: "#ffffff", type: "gradient", pattern: "grid" },
  { name: "Cyber Lime", bg1: "#04130d", bg2: "#12351f", primary: "#a3e635", text: "#f7fee7", type: "animated", pattern: "grid" },
  { name: "Cherry Glass", bg1: "#210008", bg2: "#6d1231", primary: "#fb7185", text: "#fff1f2", type: "gradient", pattern: "dots" },
  { name: "Aurora", bg1: "#06111f", bg2: "#0f766e", primary: "#5eead4", text: "#ecfeff", type: "animated", pattern: "rays" },
  { name: "Ink Studio", bg1: "#050505", bg2: "#202020", primary: "#f5f5f5", text: "#ffffff", type: "solid", pattern: "none" },
  { name: "Solar Pop", bg1: "#371600", bg2: "#7c2d12", primary: "#facc15", text: "#fff7ed", type: "gradient", pattern: "rays" },
  { name: "Deep Ocean", bg1: "#00111f", bg2: "#003b73", primary: "#38bdf8", text: "#f0f9ff", type: "gradient", pattern: "stars" },
  { name: "Editorial", bg1: "#111111", bg2: "#3f3f46", primary: "#eab308", text: "#fafafa", type: "gradient", pattern: "none" },
  { name: "Berry Wave", bg1: "#190026", bg2: "#831843", primary: "#f0abfc", text: "#fdf4ff", type: "animated", pattern: "dots" },
  { name: "Clean Slate", bg1: "#e2e8f0", bg2: "#f8fafc", primary: "#0f172a", text: "#0f172a", type: "gradient", pattern: "grid" },
  { name: "Terminal", bg1: "#020617", bg2: "#052e16", primary: "#22c55e", text: "#dcfce7", type: "solid", pattern: "grid" },
  { name: "Hotline", bg1: "#12091f", bg2: "#be123c", primary: "#fb923c", text: "#fff7ed", type: "animated", pattern: "rays" },
];

const FONTS = [
  { value: "Inter", label: "Inter", preview: "Clean creator profile" },
  { value: "Playfair Display", label: "Playfair", preview: "Editorial launch page" },
  { value: "Space Grotesk", label: "Space Grotesk", preview: "Future-ready links" },
  { value: "Nunito", label: "Nunito", preview: "Friendly community hub" },
  { value: "DM Sans", label: "DM Sans", preview: "Modern product profile" },
  { value: "Bebas Neue", label: "Bebas Neue", preview: "LOUD DROP TODAY" },
  { value: "Manrope", label: "Manrope", preview: "Polished business page" },
  { value: "Syne", label: "Syne", preview: "Creative portfolio" },
  { value: "JetBrains Mono", label: "JetBrains Mono", preview: "dev@linkflow:~$" },
];

type Tab = "background" | "widgets" | "typography";

interface AppearanceEditorProps {
  theme: ProfileTheme;
  onUpdate: (u: Partial<ProfileTheme>) => void;
}

export function AppearanceEditor({ theme, onUpdate }: AppearanceEditorProps) {
  const [currentTab, setCurrentTab] = useState<Tab>("background");
  const tabs: { id: Tab; label: string; icon: React.ComponentType<any> }[] = [
    { id: "background", label: "Background", icon: Image },
    { id: "widgets", label: "Blocks", icon: Layers },
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
      <div className="grid grid-cols-3 gap-1 rounded-xl p-1" style={{ background: "rgba(255,255,255,0.05)" }}>
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
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
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
                      })
                    }
                    className="relative overflow-hidden rounded-xl"
                    style={{ aspectRatio: "1.08", outline: selected ? "2px solid #ffffff" : "1px solid rgba(255,255,255,0.08)", outlineOffset: "2px" }}
                  >
                    <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${preset.bg1}, ${preset.bg2})` }} />
                    <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1.5" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)" }}>
                      <p className="truncate text-center" style={{ color: preset.text, fontSize: "9px", fontWeight: 700 }}>{preset.name}</p>
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
              ]}
              onChange={(value) => onUpdate({ backgroundPattern: value as NonNullable<ProfileTheme["backgroundPattern"]> })}
            />
          </Panel>

          <Panel title="Colors">
            <ColorRow label="Background 1" value={theme.bgColor1} onChange={(value) => onUpdate({ bgColor1: value })} />
            <ColorRow label="Background 2" value={theme.bgColor2} onChange={(value) => onUpdate({ bgColor2: value })} />
          </Panel>

          <Panel title="Image Overlay">
            <input
              type="range"
              min={0}
              max={90}
              value={theme.backgroundOverlay ?? 45}
              onChange={(event) => onUpdate({ backgroundOverlay: Number(event.target.value) })}
              className="w-full accent-violet-500"
            />
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
          <Panel title="Page Width">
            <Segmented
              value={theme.contentWidth ?? "comfortable"}
              options={[
                ["compact", "Compact"],
                ["comfortable", "Comfort"],
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
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
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

function CheckMark() {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-white">
      <Check size={11} />
    </span>
  );
}
