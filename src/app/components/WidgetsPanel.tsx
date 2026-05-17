import { useState } from "react";
import { Eye, EyeOff, Plus, Settings, Trash2 } from "lucide-react";
import type { WidgetItem } from "../App";
import { getWidgetPlugin, MUSIC_TRACK_PRESETS, WIDGET_PLUGINS } from "../widgetPlugins";

interface WidgetsPanelProps {
  widgets: WidgetItem[];
  onAdd: (w: Omit<WidgetItem, "id">) => void;
  onUpdate: (id: string, u: Partial<WidgetItem>) => void;
  onRemove: (id: string) => void;
}

export function WidgetsPanel({ widgets, onAdd, onUpdate, onRemove }: WidgetsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAdd = (type: WidgetItem["type"]) => {
    const plugin = getWidgetPlugin(type);
    if (!plugin) return;
    onAdd({
      type,
      title: plugin.label,
      visible: true,
      config: { ...plugin.defaultConfig },
    });
  };

  return (
    <div className="space-y-6">
      {widgets.length > 0 && (
        <div>
          <h3 className="text-white mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            Active Widgets
          </h3>
          <div className="space-y-2">
            {widgets.map((widget) => {
              const plugin = getWidgetPlugin(widget.type);
              if (!plugin) return null;
              const Icon = plugin.icon;
              const isExpanded = expandedId === widget.id;

              return (
                <div
                  key={widget.id}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${plugin.color}18` }}
                    >
                      <Icon size={16} style={{ color: plugin.color }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white truncate" style={{ fontSize: "13px", fontWeight: 500 }}>
                        {widget.title}
                      </p>
                      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                        {plugin.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => onUpdate(widget.id, { visible: !widget.visible })}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: widget.visible ? "#a855f7" : "rgba(255,255,255,0.25)" }}
                        title={widget.visible ? "Hide widget" : "Show widget"}
                      >
                        {widget.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : widget.id)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: "rgba(255,255,255,0.25)" }}
                        title="Configure"
                      >
                        <Settings size={14} />
                      </button>

                      <button
                        onClick={() => onRemove(widget.id)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: "rgba(255,255,255,0.2)" }}
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <WidgetConfigForm widget={widget} onUpdate={onUpdate} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-white mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
          {widgets.length === 0 ? "Add a Widget" : "Add More Widgets"}
        </h3>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", marginBottom: "12px" }}>
          Add plugin blocks for content, commerce, locations, capture, and messaging
        </p>
        <div className="grid grid-cols-1 gap-2">
          {WIDGET_PLUGINS.map((plugin) => {
            const Icon = plugin.icon;
            return (
              <button
                key={plugin.type}
                onClick={() => handleAdd(plugin.type)}
                className="flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-left"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)")}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${plugin.color}18` }}
                >
                  <Icon size={18} style={{ color: plugin.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white" style={{ fontSize: "13px", fontWeight: 500 }}>
                    {plugin.label}
                  </p>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>
                    {plugin.description}
                  </p>
                </div>
                <div
                  className="rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ width: "28px", height: "28px", background: "rgba(168, 85, 247, 0.15)", color: "#c084fc" }}
                >
                  <Plus size={14} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WidgetConfigForm({
  widget,
  onUpdate,
}: {
  widget: WidgetItem;
  onUpdate: (id: string, u: Partial<WidgetItem>) => void;
}) {
  const updateConfig = (key: string, value: string) => {
    onUpdate(widget.id, { config: { ...widget.config, [key]: value } });
  };

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    padding: "8px 12px",
    color: "white",
    fontSize: "13px",
    width: "100%",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "11px",
    color: "rgba(255,255,255,0.4)",
    display: "block",
    marginBottom: "4px",
  };

  const textField = (label: string, key: string, placeholder: string) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        value={widget.config[key] ?? ""}
        onChange={(e) => updateConfig(key, e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
        onFocus={(e) => (e.target.style.borderColor = "#a855f7")}
        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
      />
    </div>
  );

  const textArea = (label: string, key: string, placeholder: string) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <textarea
        value={widget.config[key] ?? ""}
        onChange={(e) => updateConfig(key, e.target.value)}
        placeholder={placeholder}
        rows={3}
        style={{ ...inputStyle, resize: "none" }}
        onFocus={(e) => (e.target.style.borderColor = "#a855f7")}
        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
      />
    </div>
  );

  switch (widget.type) {
    case "music":
      return (
        <>
          <div>
            <label style={labelStyle}>Spotify preset</label>
            <select
              value={widget.config.trackId ?? "blinding-lights"}
              onChange={(e) => {
                const preset = MUSIC_TRACK_PRESETS.find((track) => track.id === e.target.value);
                onUpdate(widget.id, {
                  config: {
                    ...widget.config,
                    trackId: e.target.value,
                    song: preset?.song ?? widget.config.song,
                    artist: preset?.artist ?? widget.config.artist,
                    spotifyUrl: preset?.spotifyUrl ?? widget.config.spotifyUrl,
                    color: preset?.color ?? widget.config.color,
                    bpm: preset?.bpm ?? widget.config.bpm,
                    bass: preset?.bass ?? widget.config.bass,
                    lead: preset?.lead ?? widget.config.lead,
                  },
                });
              }}
              style={{ ...inputStyle, colorScheme: "dark" }}
              onFocus={(e) => (e.target.style.borderColor = "#a855f7")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            >
              {MUSIC_TRACK_PRESETS.map((track) => (
                <option key={track.id} value={track.id}>
                  {track.song} - {track.artist}
                </option>
              ))}
            </select>
          </div>
          {textField("Display title", "song", "Song title")}
          {textField("Display artist", "artist", "Artist name")}
          {textField("Spotify track / album / playlist URL", "spotifyUrl", "https://open.spotify.com/track/...")}
          {textField("Rhythm BPM", "bpm", "120")}
        </>
      );

    case "countdown":
      return (
        <>
          {textField("Event label", "label", "Product Launch")}
          <div>
            <label style={labelStyle}>Target date</label>
            <input
              type="date"
              value={widget.config.targetDate ?? ""}
              onChange={(e) => updateConfig("targetDate", e.target.value)}
              style={{ ...inputStyle, colorScheme: "dark" }}
              onFocus={(e) => (e.target.style.borderColor = "#a855f7")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>
        </>
      );

    case "poll":
      return (
        <>
          {textField("Question", "question", "Your poll question")}
          {["Option A", "Option B"].map((label, index) => (
            <div key={label}>
              <label style={labelStyle}>{label}</label>
              <input
                value={(widget.config.options ?? [])[index] ?? ""}
                onChange={(e) => {
                  const options = [...(widget.config.options ?? ["", ""])];
                  options[index] = e.target.value;
                  onUpdate(widget.id, { config: { ...widget.config, options } });
                }}
                placeholder={label}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#a855f7")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
          ))}
        </>
      );

    case "email":
      return (
        <>
          {textField("Call to action text", "label", "Subscribe for updates")}
          {textField("Subscriber count", "count", "1,200+")}
        </>
      );

    case "video":
      return (
        <>
          {textField("Video title", "title", "My Latest Video")}
          {textField("View count", "views", "12K")}
          {textField("Video URL", "url", "https://youtube.com/...")}
        </>
      );

    case "product":
      return (
        <>
          {textField("Product name", "name", "Product name")}
          {textField("Price", "price", "$29")}
          {textArea("Description", "description", "Short product description")}
          {textField("Button label", "buttonLabel", "View product")}
          {textField("Product URL", "url", "https://example.com/product")}
        </>
      );

    case "map":
      return (
        <>
          {textField("Place name", "place", "Studio HQ")}
          {textField("Address", "address", "123 Creator Ave")}
          {textField("Map URL", "url", "https://maps.google.com")}
        </>
      );

    case "chat":
      return (
        <>
          {textField("Headline", "headline", "Have a question?")}
          {textArea("Message", "message", "Send me a quick message")}
          {textField("Button label", "buttonLabel", "Start chat")}
          {textField("Chat URL", "url", "mailto:hello@example.com")}
        </>
      );

    default:
      return null;
  }
}
