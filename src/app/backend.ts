import type { LinkItem, ProfileTheme, UserProfile, WidgetItem } from "./App";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

export interface AppSnapshot {
  user: AuthUser;
  profile: UserProfile;
  links: LinkItem[];
  theme: ProfileTheme;
  widgets: WidgetItem[];
}

export interface EmailVerificationRequired {
  requiresEmailVerification: true;
  email: string;
  devVerificationUrl?: string;
}

export interface PublicProfileSnapshot {
  profile: UserProfile;
  links: LinkItem[];
  theme: ProfileTheme;
  widgets: WidgetItem[];
}

export interface AnalyticsSummary {
  dailyData: { date: string; clicks: number }[];
  linkClickData: { id: string; name: string; clicks: number }[];
  deviceData: { name: string; value: number; color: string }[];
  geoData: { country: string; visits: number }[];
}

interface StoredUser extends AuthUser {
  password: string;
  emailVerifiedAt?: string | null;
}

interface StoredState {
  users: StoredUser[];
  currentUserId: string | null;
  profiles: Record<string, UserProfile>;
  links: Record<string, LinkItem[]>;
  themes: Record<string, ProfileTheme>;
  widgets: Record<string, WidgetItem[]>;
  analytics: Record<string, Record<string, number>>;
  emailVerificationTokens?: Record<string, { userId: string; expiresAt: string; createdAt: string }>;
}

const STORAGE_KEY = "linkflow.backend.v1";
const API_TOKEN_KEY = "linkflow.api.token";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.PROD ? "/api" : "");

const defaultProfile: UserProfile = {
  displayName: "Alex Rivera",
  username: "alexrivera",
  bio: "Designer & Developer | Building cool stuff | LA",
  avatarColor: "#7c3aed",
  initials: "AR",
};

const defaultLinks: LinkItem[] = [
  { id: "1", title: "My Portfolio", url: "https://portfolio.example.com", visible: true, platform: "website", buttonStyle: "pill", hoverEffect: "glow" },
  { id: "2", title: "YouTube Channel", url: "https://youtube.com", visible: true, platform: "youtube", buttonStyle: "pill", hoverEffect: "bounce" },
  { id: "3", title: "Instagram", url: "https://instagram.com", visible: true, platform: "instagram", buttonStyle: "pill", hoverEffect: "glow" },
  { id: "4", title: "GitHub", url: "https://github.com", visible: true, platform: "github", buttonStyle: "pill", hoverEffect: "expand" },
  { id: "5", title: "Spotify Playlist", url: "https://spotify.com", visible: false, platform: "spotify", buttonStyle: "pill", hoverEffect: "none" },
  { id: "6", title: "Buy Me a Coffee", url: "https://buymeacoffee.com", visible: true, platform: "coffee", buttonStyle: "pill", hoverEffect: "glow" },
];

const defaultTheme: ProfileTheme = {
  backgroundType: "gradient",
  bgColor1: "#0f0c29",
  bgColor2: "#302b63",
  buttonStyle: "pill",
  hoverEffect: "glow",
  layoutMode: "vertical",
  fontFamily: "Inter",
  primaryColor: "#a855f7",
  textColor: "#ffffff",
  backgroundPattern: "grid",
  backgroundOverlay: 45,
  profileStyle: "halo",
  widgetStyle: "glass",
  contentWidth: "comfortable",
  animationPack: "smooth",
  iconStyle: "brand",
};

const defaultWidgets: WidgetItem[] = [
  { id: "w1", type: "music", title: "Now Playing", visible: true, config: { trackId: "blinding-lights", song: "Blinding Lights", artist: "The Weeknd", spotifyUrl: "https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b" } },
  { id: "w2", type: "countdown", title: "Launch Countdown", visible: false, config: { targetDate: "2026-12-31", label: "New Year 2027" } },
  { id: "w3", type: "product", title: "Product Card", visible: true, config: { name: "Digital Starter Kit", price: "$29", description: "Templates, assets, and resources in one bundle.", buttonLabel: "View product", url: "https://example.com/product" } },
  { id: "w4", type: "map", title: "Map Location", visible: false, config: { place: "Studio HQ", address: "123 Creator Ave, Los Angeles", url: "https://maps.google.com" } },
  { id: "w5", type: "chat", title: "Chat Bubble", visible: true, config: { headline: "Have a question?", message: "Send me a quick message and I will get back to you.", buttonLabel: "Start chat", url: "mailto:hello@example.com" } },
];

function delay<T>(value: T, ms = 150): Promise<T> {
  return new Promise((resolve) => window.setTimeout(() => resolve(value), ms));
}

function hasApiBackend() {
  return API_BASE_URL.trim().length > 0;
}

function getToken() {
  return window.localStorage.getItem(API_TOKEN_KEY);
}

function setToken(token: string | null) {
  if (token) {
    window.localStorage.setItem(API_TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(API_TOKEN_KEY);
  }
}

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error ?? "Request failed.");
  }

  return payload as T;
}

async function apiAuth(path: string, body: Record<string, unknown>) {
  const payload = await apiRequest<{ token: string; snapshot: AppSnapshot }>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
  setToken(payload.token);
  return payload.snapshot;
}

function id(prefix = "id") {
  const value = window.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${value}`;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function initialState(): StoredState {
  const demoUser: StoredUser = {
    id: "demo_user",
    email: "demo@linkflow.local",
    username: defaultProfile.username,
    password: "password",
    emailVerifiedAt: new Date().toISOString(),
  };

  return {
    users: [demoUser],
    currentUserId: null,
    profiles: { [demoUser.id]: clone(defaultProfile) },
    links: { [demoUser.id]: clone(defaultLinks) },
    themes: { [demoUser.id]: clone(defaultTheme) },
    widgets: { [demoUser.id]: clone(defaultWidgets) },
    analytics: { [demoUser.id]: {} },
    emailVerificationTokens: {},
  };
}

function readState(): StoredState {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return initialState();

  try {
    return { ...initialState(), ...JSON.parse(raw) };
  } catch {
    return initialState();
  }
}

function writeState(state: StoredState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getEmailVerificationTokens(state: StoredState) {
  state.emailVerificationTokens ??= {};
  return state.emailVerificationTokens;
}

function makeVerificationToken() {
  return window.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

function isEmailVerified(user: StoredUser) {
  return Boolean(user.emailVerifiedAt) || !Object.prototype.hasOwnProperty.call(user, "emailVerifiedAt");
}

function requireCurrentUser(state: StoredState) {
  const user = state.users.find((u) => u.id === state.currentUserId);
  if (!user) throw new Error("You must be signed in.");
  return user;
}

function snapshotForUser(state: StoredState, user: AuthUser): AppSnapshot {
  return {
    user: { id: user.id, email: user.email, username: user.username },
    profile: clone(state.profiles[user.id] ?? defaultProfile),
    links: clone(state.links[user.id] ?? defaultLinks),
    theme: clone(state.themes[user.id] ?? defaultTheme),
    widgets: clone(state.widgets[user.id] ?? defaultWidgets),
  };
}

function publicSnapshotForUser(state: StoredState, user: AuthUser): PublicProfileSnapshot {
  return {
    profile: clone(state.profiles[user.id] ?? defaultProfile),
    links: clone((state.links[user.id] ?? []).filter((link) => link.visible)),
    theme: clone(state.themes[user.id] ?? defaultTheme),
    widgets: clone((state.widgets[user.id] ?? []).filter((widget) => widget.visible)),
  };
}

function initialsFromUsername(username: string) {
  return username.slice(0, 2).toUpperCase();
}

function assertUrl(value: string, field = "URL", protocols = ["http:", "https:", "mailto:", "tel:"]) {
  try {
    const url = new URL(value);
    if (!protocols.includes(url.protocol)) throw new Error();
  } catch {
    throw new Error(`${field} must be a valid ${protocols.map((protocol) => protocol.replace(":", "")).join("/")} URL.`);
  }
}

function validateWidgetConfig(config: Record<string, any>) {
  // Widget fields autosave on each keystroke, so URL values can be temporary drafts.
  // The public renderer sanitizes widget URLs before using them.
  void config;
}

export function detectPlatform(url: string): string {
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

export async function getSession() {
  if (hasApiBackend()) {
    if (!getToken()) return null;
    try {
      const payload = await apiRequest<{ snapshot: AppSnapshot }>("/auth/session");
      return payload.snapshot;
    } catch {
      setToken(null);
      return null;
    }
  }

  const state = readState();
  const user = state.users.find((u) => u.id === state.currentUserId);
  return delay(user ? snapshotForUser(state, user) : null);
}

export async function register(input: { email: string; password: string; username: string }) {
  if (hasApiBackend()) {
    return apiRequest<EmailVerificationRequired>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  const state = readState();
  const username = input.username.trim().toLowerCase();
  const email = input.email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");
  if (!/^[a-z0-9_.-]{3,30}$/.test(username)) throw new Error("Username must be 3-30 URL-safe characters.");
  if (input.password.length < 8) throw new Error("Password must be at least 8 characters.");
  if (state.users.some((u) => u.email === email)) throw new Error("Email is already registered.");
  if (state.users.some((u) => u.username === username)) throw new Error("Username is already taken.");

  const user: StoredUser = { id: id("user"), email, username, password: input.password };
  state.users.push(user);
  user.emailVerifiedAt = null;
  state.profiles[user.id] = { ...clone(defaultProfile), displayName: username, username, initials: initialsFromUsername(username) };
  state.links[user.id] = [];
  state.themes[user.id] = clone(defaultTheme);
  state.widgets[user.id] = [];
  state.analytics[user.id] = {};
  state.currentUserId = null;
  const token = makeVerificationToken();
  getEmailVerificationTokens(state)[token] = {
    userId: user.id,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
  writeState(state);
  return delay({ requiresEmailVerification: true, email, devVerificationUrl: `${window.location.origin}/?email_verify_token=${encodeURIComponent(token)}` });
}

export async function login(input: { email: string; password: string }) {
  if (hasApiBackend()) {
    return apiAuth("/auth/login", input);
  }

  const state = readState();
  const user = state.users.find((u) => u.email === input.email.trim().toLowerCase() && u.password === input.password);
  if (!user) throw new Error("Invalid email or password.");
  if (!isEmailVerified(user)) throw new Error("Confirm your email before signing in. Check your inbox for the verification link.");
  state.currentUserId = user.id;
  writeState(state);
  return delay(snapshotForUser(state, user));
}

export async function socialLogin(provider: "google" | "apple") {
  if (hasApiBackend()) {
    return apiAuth("/auth/social", { provider });
  }

  const state = readState();
  const email = `${provider}@linkflow.local`;
  let user = state.users.find((u) => u.email === email);

  if (!user) {
    user = { id: id("user"), email, username: `${provider}_creator`, password: id("oauth"), emailVerifiedAt: new Date().toISOString() };
    state.users.push(user);
    state.profiles[user.id] = { ...clone(defaultProfile), username: user.username };
    state.links[user.id] = clone(defaultLinks);
    state.themes[user.id] = clone(defaultTheme);
    state.widgets[user.id] = clone(defaultWidgets);
    state.analytics[user.id] = {};
  }

  state.currentUserId = user.id;
  writeState(state);
  return delay(snapshotForUser(state, user));
}

export async function resendVerificationEmail(email: string) {
  if (hasApiBackend()) {
    await apiRequest<{ ok: boolean }>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return true;
  }

  const state = readState();
  const user = state.users.find((u) => u.email === email.trim().toLowerCase());
  if (user && !isEmailVerified(user)) {
    const token = makeVerificationToken();
    getEmailVerificationTokens(state)[token] = {
      userId: user.id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    writeState(state);
    console.info(`[email verification] ${email}: ${window.location.origin}/?email_verify_token=${encodeURIComponent(token)}`);
  }
  return delay(true);
}

export async function verifyEmail(token: string) {
  if (hasApiBackend()) {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}`, { redirect: "manual" });
    return response.status >= 200 && response.status < 400;
  }

  const state = readState();
  const tokens = getEmailVerificationTokens(state);
  const record = tokens[token];
  if (!record || new Date(record.expiresAt).getTime() < Date.now()) return delay(false);
  const user = state.users.find((u) => u.id === record.userId);
  if (!user) return delay(false);
  user.emailVerifiedAt = new Date().toISOString();
  for (const [storedToken, storedRecord] of Object.entries(tokens)) {
    if (storedRecord.userId === user.id) delete tokens[storedToken];
  }
  writeState(state);
  return delay(true);
}

export async function logout() {
  if (hasApiBackend()) {
    setToken(null);
    return true;
  }

  const state = readState();
  state.currentUserId = null;
  writeState(state);
  return delay(true);
}

export async function getPublicProfile(username: string) {
  if (hasApiBackend()) {
    const payload = await apiRequest<{ profile: PublicProfileSnapshot }>(`/public/${encodeURIComponent(username)}`);
    return payload.profile;
  }

  const state = readState();
  const user = state.users.find((u) => u.username === username.toLowerCase());
  if (!user) throw new Error("Profile not found.");
  return delay(publicSnapshotForUser(state, user));
}

export async function updateProfile(updates: Partial<UserProfile>) {
  if (hasApiBackend()) {
    const payload = await apiRequest<{ profile: UserProfile }>("/profile", {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    return payload.profile;
  }

  const state = readState();
  const user = requireCurrentUser(state);
  state.profiles[user.id] = { ...state.profiles[user.id], ...updates };
  if (updates.username) user.username = updates.username;
  writeState(state);
  return delay(clone(state.profiles[user.id]));
}

export async function addLink(link: Omit<LinkItem, "id">) {
  if (hasApiBackend()) {
    const payload = await apiRequest<{ link: LinkItem }>("/links", {
      method: "POST",
      body: JSON.stringify(link),
    });
    return payload.link;
  }

  const state = readState();
  const user = requireCurrentUser(state);
  assertUrl(link.url);
  const item = { ...link, platform: link.platform || detectPlatform(link.url), id: id("link") };
  state.links[user.id] = [...(state.links[user.id] ?? []), item];
  writeState(state);
  return delay(clone(item));
}

export async function updateLink(linkId: string, updates: Partial<LinkItem>) {
  if (hasApiBackend()) {
    const payload = await apiRequest<{ links: LinkItem[] }>(`/links/${encodeURIComponent(linkId)}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    return payload.links;
  }

  const state = readState();
  const user = requireCurrentUser(state);
  if (updates.url) assertUrl(updates.url);
  state.links[user.id] = (state.links[user.id] ?? []).map((link) =>
    link.id === linkId ? { ...link, ...updates, platform: updates.url ? detectPlatform(updates.url) : link.platform } : link
  );
  writeState(state);
  return delay(clone(state.links[user.id]));
}

export async function removeLink(linkId: string) {
  if (hasApiBackend()) {
    const payload = await apiRequest<{ links: LinkItem[] }>(`/links/${encodeURIComponent(linkId)}`, {
      method: "DELETE",
    });
    return payload.links;
  }

  const state = readState();
  const user = requireCurrentUser(state);
  state.links[user.id] = (state.links[user.id] ?? []).filter((link) => link.id !== linkId);
  writeState(state);
  return delay(clone(state.links[user.id]));
}

export async function reorderLinks(from: number, to: number) {
  if (hasApiBackend()) {
    const payload = await apiRequest<{ links: LinkItem[] }>("/links/reorder", {
      method: "POST",
      body: JSON.stringify({ from, to }),
    });
    return payload.links;
  }

  const state = readState();
  const user = requireCurrentUser(state);
  const links = [...(state.links[user.id] ?? [])];
  const [item] = links.splice(from, 1);
  if (item) links.splice(to, 0, item);
  state.links[user.id] = links;
  writeState(state);
  return delay(clone(links));
}

export async function updateTheme(updates: Partial<ProfileTheme>) {
  if (hasApiBackend()) {
    const payload = await apiRequest<{ theme: ProfileTheme }>("/theme", {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    return payload.theme;
  }

  const state = readState();
  const user = requireCurrentUser(state);
  state.themes[user.id] = { ...state.themes[user.id], ...updates };
  writeState(state);
  return delay(clone(state.themes[user.id]));
}

export async function addWidget(widget: Omit<WidgetItem, "id">) {
  if (hasApiBackend()) {
    const payload = await apiRequest<{ widget: WidgetItem }>("/widgets", {
      method: "POST",
      body: JSON.stringify(widget),
    });
    return payload.widget;
  }

  const state = readState();
  const user = requireCurrentUser(state);
  validateWidgetConfig(widget.config);
  const item = { ...widget, id: id("widget") };
  state.widgets[user.id] = [...(state.widgets[user.id] ?? []), item];
  writeState(state);
  return delay(clone(item));
}

export async function updateWidget(widgetId: string, updates: Partial<WidgetItem>) {
  if (hasApiBackend()) {
    const payload = await apiRequest<{ widgets: WidgetItem[] }>(`/widgets/${encodeURIComponent(widgetId)}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    return payload.widgets;
  }

  const state = readState();
  const user = requireCurrentUser(state);
  if (updates.config) validateWidgetConfig(updates.config);
  state.widgets[user.id] = (state.widgets[user.id] ?? []).map((widget) =>
    widget.id === widgetId ? { ...widget, ...updates } : widget
  );
  writeState(state);
  return delay(clone(state.widgets[user.id]));
}

export async function removeWidget(widgetId: string) {
  if (hasApiBackend()) {
    const payload = await apiRequest<{ widgets: WidgetItem[] }>(`/widgets/${encodeURIComponent(widgetId)}`, {
      method: "DELETE",
    });
    return payload.widgets;
  }

  const state = readState();
  const user = requireCurrentUser(state);
  state.widgets[user.id] = (state.widgets[user.id] ?? []).filter((widget) => widget.id !== widgetId);
  writeState(state);
  return delay(clone(state.widgets[user.id]));
}

export async function trackClick(linkId: string) {
  if (hasApiBackend()) {
    await apiRequest<{ ok: boolean }>("/analytics/click", {
      method: "POST",
      body: JSON.stringify({ linkId }),
    });
    return true;
  }

  const state = readState();
  const user = state.users.find((u) => u.id === state.currentUserId) ?? state.users[0];
  const bucket = state.analytics[user.id] ?? {};
  bucket[linkId] = (bucket[linkId] ?? 0) + 1;
  state.analytics[user.id] = bucket;
  writeState(state);
  return delay(true, 30);
}

export async function voteWidget(widgetId: string, optionIndex: number) {
  if (hasApiBackend()) {
    const payload = await apiRequest<{ widget: WidgetItem }>(`/widgets/${encodeURIComponent(widgetId)}/vote`, {
      method: "POST",
      body: JSON.stringify({ optionIndex }),
    });
    return payload.widget;
  }

  const state = readState();
  let updated: WidgetItem | null = null;
  for (const [userId, widgets] of Object.entries(state.widgets)) {
    state.widgets[userId] = widgets.map((widget) => {
      if (widget.id !== widgetId) return widget;
      const votes = [...(widget.config.votes ?? [0, 0])];
      votes[optionIndex] = (Number(votes[optionIndex]) || 0) + 1;
      updated = { ...widget, config: { ...widget.config, votes } };
      return updated;
    });
  }
  writeState(state);
  if (!updated) throw new Error("Widget not found.");
  return delay(clone(updated));
}

export async function subscribeWidget(widgetId: string, email: string) {
  if (hasApiBackend()) {
    const payload = await apiRequest<{ widget: WidgetItem }>(`/widgets/${encodeURIComponent(widgetId)}/subscribe`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return payload.widget;
  }

  const state = readState();
  let updated: WidgetItem | null = null;
  for (const [userId, widgets] of Object.entries(state.widgets)) {
    state.widgets[userId] = widgets.map((widget) => {
      if (widget.id !== widgetId) return widget;
      const subscribers = Array.from(new Set([...(widget.config.subscribers ?? []), email.toLowerCase()]));
      updated = { ...widget, config: { ...widget.config, subscribers, count: subscribers.length.toLocaleString() } };
      return updated;
    });
  }
  writeState(state);
  if (!updated) throw new Error("Widget not found.");
  return delay(clone(updated));
}

export async function getAnalytics(): Promise<AnalyticsSummary> {
  if (hasApiBackend()) {
    const payload = await apiRequest<{ analytics: AnalyticsSummary }>("/analytics");
    return payload.analytics;
  }

  const state = readState();
  const user = requireCurrentUser(state);
  const links = state.links[user.id] ?? [];
  const storedClicks = state.analytics[user.id] ?? {};
  const totalTracked = Object.values(storedClicks).reduce((sum, value) => sum + value, 0);

  const dailyData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      clicks: Math.max(4, Math.round((totalTracked + links.length * 12) * (0.45 + i / 42))),
    };
  });

  const linkClickData = links
    .filter((link) => link.visible)
    .map((link, i) => ({
      id: link.id,
      name: link.title.length > 18 ? `${link.title.slice(0, 18)}...` : link.title,
      clicks: (storedClicks[link.id] ?? 0) + (links.length - i) * 17,
    }))
    .sort((a, b) => b.clicks - a.clicks);

  return delay({
    dailyData,
    linkClickData,
    deviceData: [
      { name: "Mobile", value: 64, color: "#a855f7" },
      { name: "Desktop", value: 28, color: "#3b82f6" },
      { name: "Tablet", value: 8, color: "#ec4899" },
    ],
    geoData: [
      { country: "United States", visits: 1240 },
      { country: "United Kingdom", visits: 480 },
      { country: "Germany", visits: 310 },
      { country: "France", visits: 270 },
      { country: "Brazil", visits: 220 },
      { country: "Australia", visits: 190 },
    ],
  });
}
