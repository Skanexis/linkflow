import type { ComponentType } from "react";
import { BarChart2, Clock, Mail, MapPin, MessageCircle, Music, ShoppingBag, Video } from "lucide-react";

export type WidgetType = "music" | "countdown" | "poll" | "email" | "video" | "product" | "map" | "chat";

export interface WidgetPlugin {
  type: WidgetType;
  label: string;
  description: string;
  icon: ComponentType<any>;
  color: string;
  defaultConfig: Record<string, any>;
}

export const MUSIC_TRACK_PRESETS = [
  { id: "blinding-lights", song: "Blinding Lights", artist: "The Weeknd", color: "#1DB954", spotifyUrl: "https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b", bpm: 171, bass: 82, lead: 246 },
  { id: "get-lucky", song: "Get Lucky", artist: "Daft Punk", color: "#f59e0b", spotifyUrl: "https://open.spotify.com/track/2Foc5Q5nqNiosCNqttzHof", bpm: 116, bass: 65, lead: 196 },
  { id: "bad-guy", song: "bad guy", artist: "Billie Eilish", color: "#a3e635", spotifyUrl: "https://open.spotify.com/track/2Fxmhks0bxGSBdJ92vM42m", bpm: 135, bass: 98, lead: 329 },
  { id: "never-gonna-give-you-up", song: "Never Gonna Give You Up", artist: "Rick Astley", color: "#38bdf8", spotifyUrl: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT", bpm: 113, bass: 55, lead: 164 },
];

export const WIDGET_PLUGINS: WidgetPlugin[] = [
  {
    type: "music",
    label: "Music Player",
    description: "Embed a playable Spotify track",
    icon: Music,
    color: "#1DB954",
    defaultConfig: {
      trackId: "blinding-lights",
      song: "Blinding Lights",
      artist: "The Weeknd",
      spotifyUrl: "https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b",
    },
  },
  {
    type: "countdown",
    label: "Countdown Timer",
    description: "Count down to an important date",
    icon: Clock,
    color: "#f59e0b",
    defaultConfig: { targetDate: "2026-12-31", label: "Big Day" },
  },
  {
    type: "poll",
    label: "Poll / Vote",
    description: "Engage visitors with a quick poll",
    icon: BarChart2,
    color: "#3b82f6",
    defaultConfig: {
      question: "What do you prefer?",
      options: ["Option A", "Option B"],
      votes: [55, 45],
    },
  },
  {
    type: "email",
    label: "Email Capture",
    description: "Grow your email list",
    icon: Mail,
    color: "#ec4899",
    defaultConfig: { label: "Subscribe for updates", count: "1,200+" },
  },
  {
    type: "video",
    label: "Video Preview",
    description: "Highlight your latest video",
    icon: Video,
    color: "#FF0000",
    defaultConfig: { title: "My Latest Video", views: "12K", url: "https://youtube.com" },
  },
  {
    type: "product",
    label: "Product Card",
    description: "Promote a featured product or offer",
    icon: ShoppingBag,
    color: "#22c55e",
    defaultConfig: {
      name: "Digital Starter Kit",
      price: "$29",
      description: "Templates, assets, and resources in one bundle.",
      buttonLabel: "View product",
      url: "https://example.com/product",
    },
  },
  {
    type: "map",
    label: "Map Location",
    description: "Share a venue, studio, or event location",
    icon: MapPin,
    color: "#f97316",
    defaultConfig: {
      place: "Studio HQ",
      address: "123 Creator Ave, Los Angeles",
      url: "https://maps.google.com",
    },
  },
  {
    type: "chat",
    label: "Chat Bubble",
    description: "Invite visitors to message you",
    icon: MessageCircle,
    color: "#06b6d4",
    defaultConfig: {
      headline: "Have a question?",
      message: "Send me a quick message and I will get back to you.",
      buttonLabel: "Start chat",
      url: "mailto:hello@example.com",
    },
  },
];

export function getWidgetPlugin(type: WidgetType) {
  return WIDGET_PLUGINS.find((plugin) => plugin.type === type);
}
